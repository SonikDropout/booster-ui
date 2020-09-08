const path = require('path');
const url = require('url');
const fs = require('fs');
const electron = require('electron');
const { IS_RPI: isPi, CONFIG_PATH, COMMANDS } = require('./src/constants');
const { app, BrowserWindow, ipcMain } = electron;
const Executor = require('./src/utils/executor');
const algorithm = require('./algorithm.json');
const { executionAsyncResource } = require('async_hooks');

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
  let currentMode;
  const executor = new Executor(algorithm, ({ voltage, current }) => {
    if (voltage) {
      if (currentMode !== 1) {
        currentMode = 1;
        serial.sendCommand(COMMANDS.loadMode(currentMode));
      }
      serial.sendCommand(COMMANDS.load(voltage));
    }
    if (current) {
      if (currentMode !== 2) {
        currentMode = 2;
        serial.sendCommand(COMMANDS.loadMode(currentMode));
      }
      serial.sendCommand(COMMANDS.load(current));
    }
  });
  let logStarted,
    stopTriggerCounter = 0,
    host,
    port,
    expNum = 0;
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
      if (stopTriggerCounter < 4) {
        stopTriggerCounter++;
        return;
      }
      serial.removeListener('data', writeDataToLog);
      logger.stop(data);
      logStarted = false;
      stopTriggerCounter = 0;
      if (executor.running) {
        executor.abort();
        win.webContents.send('executionRejected');
      }
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
  ipcMain.on('execute', () =>
    executor
      .start()
      .then(() => win.webContents.send('executed'))
      .catch(() => win.webContents.send('executionAborted'))
  );
  ipcMain.on('stopExecution', executor.abort);
  ipcMain.on('pauseExecution', executor.pause);
  ipcMain.on('resumeExecution', executor.resume);
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
