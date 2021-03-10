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

const PORT = process.env.PORT || 80;

const server = http.createServer();
const app = polka({ server }).listen(PORT, (err) => {
  if (err) throw err;
  console.log(`> Running on localhost:${PORT}`);
});

const wsServer = new WebSocketServer(server);

// serial initialization

const serial = require(`./utils/serial${isPi ? '' : '.mock'}`);
const initialValues = configManager.getStartParams();
for (const key in initialValues) {
  serial.sendCommand(...COMMANDS[key](initialValues[key]));
}

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

// logger initializition

const logger = require('./utils/logger');
logger.init().catch(console.error);
let logStarted;
serial.on('data', (data) => {
  if (!logStarted && data.start.value) {
    logger
      .start(data)
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

wsServer.on('connection', (socket) => {
  serial.on('data', (data) => socket.emit('serial data', data));
  serial.on('data', (data) => {
    if (!data.start.value && executor.running) {
      executor.pause();
      socket.emit('executionRejected');
    }
  });
  socket.on('execute', executor.start);
  socket.on('stopExecution', executor.abort);
  socket.on('pauseExecution', executor.pause);
  socket.on('resumeExecution', executor.resume);
  socket.on('serial command', serial.sendCommand);
});

// config path handlers

app.get('/config/:file', (req, res) => {
  const configFile = req.params.file;
  switch (configFile) {
    case 'settings':
      res.end(JSON.stringify(configManager.getSettings()));
    case 'initialize':
      res.end(JSON.stringify(initialValues));
    case 'algorithm':
      res.end(JSON.stringify(algorithm));
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
      res.end('Updated settings!');
    case 'initialize':
      configManager.updateStartParams(req.body);
      res.end('Updated start parameters!');
    case 'algorithm':
      configManager.updateAlgorithm(req.body);
      res.end('Updated algorithm');
    default:
      res.statusCode = 404;
      res.end();
  }
});

app.get('/locale/:file', (req, res) => {
  const filename = req.params.file;
  const filePath = path.resolve('locale', filename + '.json');
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    res.end(JSON.stringify(require(filePath)));
  } else {
    res.statusCode = 404;
    res.end();
  }
});
app.use(sirv('public', 'dev'), json());
