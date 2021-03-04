const path = require('path');
const polka = require('polka');
const {
  IS_RPI: isPi,
  CONFIG_PATH,
  COMMANDS,
  LOAD_MODES,
} = require('../common/constants');
const Executor = require('../client/utils/executor');
const configManager = require('../client/utils/configManager');
const http = require('http');
const websocket = require('websocket');
const { fstat, readFile } = require('fs');
const { default: sirv } = require('sirv');

let connection = { sendBytes: Function.prototype },
  logger,
  executor;

const PORT = process.env.PORT || 80;

const server = http.createServer();
const app = polka({ server }).listen(PORT, (err) => {
  if (err) throw err;
  console.log(`> Running on localhost:${PORT}`);
});

const wsServer = websocket.server({
  httpServer: server,
  autoAcceptConnections: true,
});

wsServer.on('request', (req) => {
  connection = req.accept(null, req.origin);
  serial.on('data', connection.sendBytes);
  serial.on('data', (data) => {
    if (!data.start.value && executor.running) {
      executor.pause();
      connection.send('executionRejected');
    }
  });
  connection.on('message', (msg) => {
    if (msg.type === 'utf8') {
      switch (msg.utf8Data) {
        case 'execute':
          executor
            .start(algorithm)
            .then(() => connection.send('executed'))
            .catch(() => connection.send('executionAborted'));
        case 'stopExecution':
          executor.stop();
        case 'pauseExecution':
          executor.pause();
        case 'resumeExecution':
          executor.resume();
      }
    }
  });
  connection.on('message', (msg) => {
    if (msg.type === 'binary') serial.sendCommand(msg.binaryData);
  });
});

// serial initialization

const serial = require(`./src/utils/serial${isPi ? '' : '.mock'}`);
const initialValues = configManager.getStartParams();
for (const key in initialValues) {
  serial.sendCommand(...COMMANDS[key](initialValues[key]));
}

// executor initialization

let currentMode;
const algorithm = require(`${CONFIG_PATH}/algorithm.json`);
executor = new Executor((param, value) => {
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


// config path handlers

app.get('/config/:file', (req, res) => {
  const configFile = req.params.file;
  switch (configFile) {
    case 'settings':
      res.json(configManager.getSettings());
    case 'initialize':
      res.json(initialValues);
    case 'algorithm':
      res.json(algorithm);
    default:
      res.sendStatus(404);
  }
  res.end();
});
app.post('/config', (req, res) => {
  const configFile = req.params.file;
  switch (configFile) {
    case 'settings':
      configManager.updateSettings(req.body);
    case 'initialize':
      configManager.updateStartParams(req.body);
    case 'algorithm':
      configManager.updateAlgorithm(req.body);
    default:
      res.status(404);
  }
  res.end();
});

// logger initializition

logger = require('./utils/logger');
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

const files = sirv('static');
app.use(files);
