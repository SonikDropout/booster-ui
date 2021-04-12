const fs = require('fs');
const path = require('path');
const polka = require('polka');
const { COMMANDS, LOAD_MODES } = require('../common/constants');
const { isPi, CONFIG_PATH } = require('./globals');
const Executor = require('./utils/executor');
const configManager = require('./utils/configManager');
const http = require('http');
const WebSocketServer = require('socket.io').Server;
const sirv = require('sirv');
const { json } = require('body-parser');
const send = require('@polka/send-type');
const updater = require('./utils/updater');

const PORT = process.env.PORT || 6010;

const server = http.createServer();
const app = polka({ server }).listen(PORT, (err) => {
  if (err) throw err;
  console.log(`> Running on localhost:${PORT}`);
});

const wsServer = new WebSocketServer(server);
let wsSockets = [];

// serial initialization

const serial = require(`./utils/serial${isPi ? '' : '.mock'}`);
const initialValues = configManager.getStartParams();
for (const key in initialValues) {
  serial.sendCommand(...COMMANDS[key](initialValues[key]));
}
serial
  .on('data', (data) =>
    wsSockets.forEach((sock) => sock.emit('serial data', data))
  )
  .on('command sent', () =>
    wsSockets.forEach((sock) => sock.emit('command sent'))
  );

// executor initialization

let currentMode;
const algorithm = require(`${CONFIG_PATH}/algorithm.json`);
const executor = new Executor((param, value) => {
  if (LOAD_MODES.includes(param)) {
    let newMode = LOAD_MODES.indexOf(param);
    if (currentMode !== newMode) {
      currentMode = newMode;
      serial.sendCommand(...COMMANDS.loadMode(currentMode));
    }
    serial.sendCommand(...COMMANDS.load(value));
  } else {
    serial.sendCommand(...COMMANDS[param](value));
  }
});
serial.on('data', (data) => {
  if (!data.start.value && executor.running) {
    executor.pause();
    wsSockets.forEach((sock) => sock.emit('executionRejected'));
  }
});

// logger initializition

const logger = require('./utils/logger');
logger.init().catch(console.error);
let logStarted;
serial.on('data', (data) => {
  if (!logStarted && data.start.value) {
    logger
      .start(data)
      .then((logPath) => {
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

wsServer.on('connection', (socket) => {
  wsSockets.push(socket);
  socket.on(
    'disconnect',
    () => (wsSockets = wsSockets.filter((sock) => sock.id !== socket.id))
  );
  socket.on('check update', () => {
    updater
      .checkUpdate()
      .then((f) => {
        if (f) socket.emit('update available');
      })
      .catch(console.error);
  });
  socket.on('execute', executor.start);
  socket.on('stopExecution', executor.abort);
  socket.on('pauseExecution', executor.pause);
  socket.on('resumeExecution', executor.resume);
  socket.on('serial command', serial.sendCommand);
  socket.on('update programm', () =>
    updater
      .update()
      .then(() => wsSockets.forEach((sock) => sock.emit('update done')))
      .catch((err) => socket.emit('update failed', err))
  );
});

// config path handlers

app.get('/config/:file', (req, res) => {
  const configFile = req.params.file;
  switch (configFile) {
    case 'settings':
      res.end(JSON.stringify(configManager.getSettings()));
      break;
    case 'initialize':
      res.end(JSON.stringify(initialValues));
      break;
    case 'algorithm':
      res.end(JSON.stringify(algorithm));
      break;
    default:
      res.statusCode = 404;
      res.end();
  }
});
app.post('/config/:file', (req, res) => {
  const configFile = req.params.file;
  switch (configFile) {
    case 'settings':
      configManager.updateSettings(req.body);
      res.end('OK');
      break;
    case 'initialize':
      configManager.updateStartParams(req.body);
      res.end('OK');
      break;
    case 'algorithm':
      configManager.updateAlgorithm(req.body);
      res.end('OK');
      break;
    default:
      res.statusCode = 404;
      res.end();
  }
});

app.get('/locale/:file', (req, res) => {
  const filename = req.params.file;
  const filePath = path.join(__dirname, '..', 'locale', filename + '.json');
  if (fs.existsSync(filePath)) {
    res.end(JSON.stringify(require(filePath)));
  } else {
    res.statusCode = 404;
    res.end();
  }
});
app.use(
  sirv(path.join(__dirname, '..', 'public'), {
    dev: process.platform === 'win32',
    setHeaders: disableCache,
  }),
  json()
);
app.get('/log', (req, res) => {
  try {
    const log = fs.createReadStream(logger.logPath);
    send(res, 206, log, {
      'Content-Disposition': `attachment; filename=${logger.logName}`,
    });
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end();
  }
});

function disableCache(res, path) {
  if (/.*(.html|.js|.css)/.test(path)) {
    res.setHeader('Cache-Control', 'no-cache');
  }
}
