const fs = require('fs');
const homeDir = require('os').homedir;
const path = require('path');
const { getFormatedDate } = require('./others');
const { LOGGED_VALUES, SERIAL_DATA } = require('../constants');
const { Server } = require('net');

let log;
const sockPool = [];
const server = new Server((sock) => sockPool.push(sock));
server.listen(23);

const tableHeader = ['Время']
  .concat(
    LOGGED_VALUES.map(
      (key) => `${SERIAL_DATA[key].label}, ${SERIAL_DATA[key].units || ''}`
    )
  )
  .concat('\n')
  .join('\t');

function createLog(boosterState) {
  const logPath = path.join(
    homeDir,
    'Documents',
    `log_${getFormatedDate('YYYY-MM-DD_HH-mm-ss')}.tsv`
  );
  console.log('Start logging to file', logPath);
  log = fs.createWriteStream(logPath);
  writeLogData(generateLogHeader(boosterState));
  writeLogData(tableHeader);
}

function writeRow(boosterState) {
  writeLogData(getLogRow(boosterState));
}

function getLogRow(boosterState) {
  const row = [getFormatedDate('YYYY:MM:DD HH:mm:ss')];
  row.push.apply(
    row,
    LOGGED_VALUES.map(
      (key) => `${boosterState[key].value}${boosterState[key].units}`
    )
  );
  row.push(boosterState.isBlow ? 'П' : '-');
  row.push(boosterState.isShortCircuit ? 'КЗ' : '-');
  return row.concat('\n').join('\t');
}

function generateLogHeader(boosterState) {
  return `
Старт
${boosterState.boostMode}
Номер блока ${blockNumber}
Номер эксперимента ${boosterState.experimentNumber}
Авторазгон от ${boosterState.startCurrent} до ${boosterState.endCurrent} с шагом ${boosterState.currentStep}, время вверх ${boosterState.timeStep}сб время вниз 20с
Отсечка: ${boosterState.minPressure}бар, ${boosterState.minVoltage}В, ${boosterState.maxTemp}\u00b0С
КЗ: ${boosterState.shortCircuitDuration}мс ${boosterState.shortCircuitDelay}с
  `;
}

function saveLog(boosterState) {
  writeTerminateMessage(boosterState);
  log.end();
  log = void 0;
}

function writeTerminateMessage(boosterState) {
  for (const key of Object.keys(SIGNALS)) {
    if (boosterState[key].value) writeLogData(SIGNALS[key]);
  }
  writeLogData(STOP_BITS[boosterState.stopBit]);
}

function writeLogData(row) {
  console.log(row);
  writeLogData(row);
  sockPool.forEach((sock) => sock.write(row));
}

module.exports = {
  createLog,
  writeRow,
  saveLog,
};
