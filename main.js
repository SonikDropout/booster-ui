const path = require('path');
const url = require('url');
const fs = require('fs');
const electron = require('electron');
const { IS_RPI: isPi, CONFIG_PATH, COMMANDS } = require('./src/constants');
const { app, BrowserWindow, ipcMain } = electron;
const Executor = require('./src/utils/executor');
const checkUpdate = require('./src/utils/updater');
const { exec } = require('child_process');

let win, updateAvailable, serial, logger, executor;

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

function initPeripherals() {
  // order of calls is important here
  initSerial();
  initExecutor();
  initLogger();
  initUpdater();
  listenRenderer();
  return {
    removeAllListeners() {
      serial.close();
    },
  };
}

function initUpdater() {
  checkUpdate().then((isUpdatable) => {
    if (isUpdatable) win.webContents.send('updateAvailable');
    updateAvailable = isUpdatable;
  });
  ipcMain.on('checkUpdate', (e) => (e.returnValue = updateAvailable));
  ipcMain.on('updateProgramm', () =>
    exec('~/booster-ui/scripts/update.sh', (err) => {
      if (err) console.error(err.message);
    })
  );
}

function initExecutor() {
  let currentMode;
  const algorithm = require(`${CONFIG_PATH}/algorithm.json`);
  executor = new Executor(algorithm, ({ voltage, current }) => {
    if (voltage) {
      if (currentMode !== 1) {
        currentMode = 1;
        serial.sendCommand(...COMMANDS.loadMode(currentMode));
      }
      serial.sendCommand(...COMMANDS.load(voltage));
    }
    if (current) {
      if (currentMode !== 2) {
        currentMode = 2;
        serial.sendCommand(...COMMANDS.loadMode(currentMode));
      }
      serial.sendCommand(...COMMANDS.load(current));
    }
  });
  serial.on('data', (data) => {
    if (!data.start.value && executor.running) {
      executor.pause();
      win.webContents.send('executionRejected');
    }
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
}

function initSerial() {
  serial = require(`./src/utils/serial${isPi ? '' : '.mock'}`);
  serial.on('data', (data) => {
    win.webContents.send('serialData', data);
  });
  ipcMain.on('serialCommand', (_, ...args) => serial.sendCommand(...args));
  const initialValues = require(`${CONFIG_PATH}/initialize.json`);
  for (const key in initialValues) {
    serial.sendCommand(...COMMANDS[key](initialValues[key]));
  }
}

function initLogger() {
  logger = require('./src/utils/logger');
  logger
    .init()
    .then((address) => {
      host = address.host;
      port = address.port;
    })
    .catch(console.error);
  let logStarted,
    host,
    port,
    expNum = 0;
  serial.on('data', (data) => {
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
  ipcMain.on('serverAddressRequest', (e) => (e.returnValue = { host, port }));
  ipcMain.on('newExperimentNumber', (e, num) => (expNum = num));
}

function listenRenderer() {
  ipcMain.on('setBlockId', (_, id) => {
    const settings = require(`${CONFIG_PATH}/settings.json`);
    settings.id = id;
    fs.writeFile(
      `${CONFIG_PATH}/settings.json`,
      JSON.stringify(settings),
      () => {}
    );
  });
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
