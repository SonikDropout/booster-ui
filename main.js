const path = require('path');
const url = require('url');
const fs = require('fs');
const electron = require('electron');
const { IS_RPI: isPi, CONFIG_PATH } = require('./src/constants');
const { app, BrowserWindow, ipcMain } = electron;

let win;

const mode = process.env.NODE_ENV;

function reloadOnChange(win) {
  if (mode !== 'development') return { close: () => {} };

  const watcher = require('chokidar').watch(path.join(__dirname, 'app', '**'), {
    ignoreInitial: true,
  });

  watcher.on('change', () => {
    win.reload();
  });

  return watcher;
}

function initPeripherals(win) {
  const serial = require(`./src/utils/serial${isPi ? '' : '.mock'}`);
  const logger = require('./src/utils/logger');
  let logStarted, host, port, expNum = 0;
  logger
    .init()
    .then((address) => {
      host = address.host;
      port = address.port;
    })
    .catch(console.error);
  serial.on('data', (data) => {
    win.webContents.send('serialData', data);
    if (!logStarted && data.start.value) {
      logger
        .start(data, expNum)
        .then((logPath) => {
          console.log(logPath);
          logStarted = true;
          serial.on('data', writeDataToLog);
        })
        .catch(console.error);
    }
  });
  function writeDataToLog(data) {
    if (!data.start.value) {
      serial.removeListener('data', writeDataToLog);
      logger.stop(data);
      logStarted = false;
      return;
    }
    logger.writeRow(data);
  }
  ipcMain.on('serialCommand', (_, ...args) => serial.sendCommand(...args));
  ipcMain.on('serverAddressRequest', (e) => (e.returnValue = { host, port }));
  ipcMain.on('newExperimentNumber', (e, num) => (expNum = num));
  ipcMain.on('setBlockId', (_, id) => {
    const settings = require(CONFIG_PATH);
    settings.id = id;
    fs.writeFile(CONFIG_PATH, JSON.stringify(settings), () => {});
  });
  return {
    removeAllListeners() {
      serial.close();
    },
  };
}

function launch() {
  const screenArea = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: isPi ? screenArea.width : 1024,
    height: isPi ? screenArea.height : 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'app', 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  const watcher = reloadOnChange(win);
  const peripherals = initPeripherals(win);

  win.on('closed', function () {
    peripherals.removeAllListeners();
    win = null;
    watcher.close();
  });
}

app.on('ready', launch);
