const path = require('path');
const url = require('url');
const electron = require('electron');
const { IS_RPI: isPi } = require('./src/constants');
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
  serial.on('data', d => win.webContents.send('serialData', d));
  ipcMain.on('serialCommand', (_, ...args) => serial.sendCommand(...args));
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

  win.on('closed', function() {
    peripherals.removeAllListeners();
    win = null;
    watcher.close();
  });
}

app.on('ready', launch);
