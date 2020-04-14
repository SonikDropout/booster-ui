const path = require('path');
const url = require('url');
const fs = require('fs');
const electron = require('electron');
const { IS_RPI: isPi, TERMINATE_SIGNALS } = require('./src/constants');
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
  let logCreated;
  serial.on('data', (data) => {
    win.webContents.send('serialData', data);
    if (data.start.value && !logCreated) {
      logger.createLog(data);
      logCreated = true;
      serial.on('data', writeDataToLog);
    }
  });
  const containsTerminateSignal = (data) =>
    TERMINATE_SIGNALS.reduce((flag, key) => data[key].value || flag, false);
  function writeDataToLog(data) {
    if (containsTerminateSignal(data)) {
      serial.removeListener('data', writeDataToLog);
      logger.saveLog(data);
      logCreated = false;
      return;
    }
    logger.writeRow(data);
  }
  ipcMain.on('serialCommand', (_, ...args) => serial.sendCommand(...args));
  ipcMain.on('setBlockId', (_, id) => {
    const settings = require('./settings.json');
    settings.id = id;
    fs.writeFile('./settings.json', JSON.stringify(settings), () => {});
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
    fullscreen: isPi,
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
