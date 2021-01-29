const fs = require('fs');
const homeDir = require('os').homedir();
const path = require('path');
const { getFormatedDate, zeroPad } = require('./others');
const {
  LOGGED_VALUES,
  SERIAL_DATA,
  SIGNALS,
  BOOST_MODES,
  STOP_BITS,
  CONFIG_PATH,
  IS_RPI: isPi,
} = require('../constants');
const { Server } = require('net');
const { exec } = require('child_process');
const blockId = require(CONFIG_PATH + '/settings.json').id;

let log;
const sockPool = [];
const server = new Server((sock) => {
  sockPool.push(sock);
  sock.write(`Established connection with block ${blockId}`);
});
server.listen(6009);

function init() {
  return new Promise((resolve, reject) => {
    exec(!isPi ? 'ipconfig' : 'hostname -I', (err, ip) => {
      if (err) reject(err);
      else resolve({ host: isPi ? ip : '', port: 6009 });
    });
  });
}

const tableHeader = ['Vremya']
  .concat(
    LOGGED_VALUES.map(
      (key) =>
        `${SERIAL_DATA[key].label}${
        SERIAL_DATA[key].units ? ', ' + SERIAL_DATA[key].units : ''
        }`
    )
  )
  .concat('\n')
  .join('\t');

function start(boosterState, expNumber) {
  const date = new Date();
  const logDir = path.join(
    homeDir,
    'Documents',
    'logs',
    date.getFullYear() + '',
    zeroPad(date.getMonth() + 1, 2)
  )
  return new Promise((resolve, reject) => {
    fs.mkdir(logDir, {recursive: true}, (err) => {
      if (err) {
        reject(err);
      } else {
        const logPath = path.join(logDir, getFormatedDate('YYYY-MM-DD--HH-mm-ss') + '.tsv');
        log = fs.createWriteStream(logPath);
        writeLogData(generateLogHeader(boosterState, expNumber));
        writeLogData(tableHeader);
        resolve(logPath);
      }
    });
  })
}

function writeRow(boosterState) {
  writeLogData(getLogRow(boosterState));
  writeInterruptMessage(boosterState);
}

function getLogRow(boosterState) {
  const row = [getFormatedDate('YYYY:MM:DD HH:mm:ss')];
  row.push.apply(
    row,
    LOGGED_VALUES.map(
      (key) =>
        `${boosterState[key].prefix || ''}${boosterState[key].value}${
        boosterState[key].units || ''
        }`
    )
  );
  row.pop();
  row.pop();
  row.push(boosterState.isBlow.value ? 'P' : '-');
  row.push(boosterState.isShortCircuit.value ? 'KZ' : '-');
  return row.concat('\n').join('\t');
}

function generateLogHeader(boosterState, expNumber) {
  return `
Start
${BOOST_MODES[boosterState.boostMode.value]}
Block nomer ${blockId}
Otsechka: ${boosterState.minPressure.value}bar, ${
    boosterState.minVoltage.value
    }V, ${boosterState.maxTemp.value}C
  `;
}

function stop(boosterState) {
  writeInterruptMessage(boosterState);
  log.end();
}

function writeInterruptMessage(boosterState) {
  for (const key of Object.keys(SIGNALS)) {
    if (boosterState[key].value) writeLogData(SIGNALS[key]);
  }
}

function writeLogData(row) {
  row = row.replace('\n', '\r\n');
  try {
    log.write(row, 'ascii');
    sockPool.forEach((sock) => sock.write(row));
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  init,
  start,
  writeRow,
  stop,
};
