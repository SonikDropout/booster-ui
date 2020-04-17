const fs = require('fs');
const homeDir = require('os').homedir();
const path = require('path');
const { getFormatedDate } = require('./others');
const {
  LOGGED_VALUES,
  SERIAL_DATA,
  SIGNALS,
  BOOST_MODES,
  STOP_BITS,
  CONFIG_PATH,
} = require('../constants');
const { Server } = require('net');
const { exec } = require('child_process');
const blockId = require(CONFIG_PATH).id;

let log;
const sockPool = [];
const server = new Server((sock) => {
  sockPool.push(sock);
  sock.write(`Подключено к разгонному блоку номер ${blockId}`);
});
server.listen(6009);

function init() {
  return new Promise((resolve, reject) => {
    exec('hostname -I', (err, ip) => {
      if (err) reject(err);
      else resolve({ host: ip, port: 6009 });
    });
  });
}

const tableHeader = ['Время']
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

function createLog(boosterState) {
  const logPath = path.join(
    homeDir,
    'Documents',
    `Блок_${blockId}_${getFormatedDate('YYYY-MM-DD_HH-mm-ss')}.tsv`
  );
  console.log('Start logging to file', logPath);
  log = fs.createWriteStream(logPath);
  writeLogData(generateLogHeader(boosterState));
  writeLogData(tableHeader);
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
  row.push(boosterState.isBlow.value ? 'П' : '-');
  row.push(boosterState.isShortCircuit.value ? 'КЗ' : '-');
  return row.concat('\n').join('\t');
}

function generateLogHeader(boosterState) {
  return `
Старт
${BOOST_MODES[boosterState.boostMode.value]}
Номер блока ${blockId}
Номер эксперимента ${boosterState.experimentNumber.value}
Авторазгон от ${boosterState.startCurrent.value} до ${
    boosterState.endCurrent.value
    } с шагом ${boosterState.currentStep.value}, время вверх ${
    boosterState.timeStep.value
    }с время вниз 20с
Отсечка: ${boosterState.minPressure.value}бар, ${
    boosterState.minVoltage.value
    }В, ${boosterState.maxTemp.value}\u00b0С
  `;
}

function saveLog(boosterState) {
  writeInterruptMessage(boosterState);
  log.end();
}

function writeInterruptMessage(boosterState) {
  for (const key of Object.keys(SIGNALS)) {
    if (boosterState[key].value) writeLogData(SIGNALS[key]);
  }
  writeLogData(STOP_BITS[boosterState.stopBit.value]);
}

function writeLogData(row) {
  log.write(row);
  sockPool.forEach((sock) => sock.write(row));
}

module.exports = {
  init,
  createLog,
  writeRow,
  saveLog,
};
