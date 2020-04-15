const fs = require('fs');
const homeDir = require('os').homedir();
const path = require('path');
const { getFormatedDate } = require('./others');
const {
  LOGGED_VALUES,
  SERIAL_DATA,
  SIGNALS,
  STOP_BITS,
} = require('../constants');
const { Server } = require('net');
const { Notification } = require('electron');
const { exec } = require('child_process');

let log;
const sockPool = [];
const server = new Server((sock) => sockPool.push(sock));
server.listen();
exec('hostname -I', (err, ip) => {
  if (err) {
    console.error(err);
    return;
  }
  new Notification('Сервер слушает', {
    body: `${ip}:${server.address().port}`,
  });
});

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
      (key) => `${boosterState[key].value}${boosterState[key].units || ''}`
    )
  );
  row.pop();
  row.pop();
  row.push(boosterState.isBlow.value ? 'П' : '-');
  row.push(boosterState.isShortCircuit.value ? 'КЗ' : '-');
  return row.concat('\n').join('\t');
}

function generateLogHeader(boosterState) {
  const blockNumber = require('../../settings.json').id;
  return `
Старт
${boosterState.boostMode.value}
Номер блока ${blockNumber}
Номер эксперимента ${boosterState.experimentNumber.value}
Авторазгон от ${boosterState.startCurrent.value} до ${boosterState.endCurrent.value} с шагом ${boosterState.currentStep.value}, время вверх ${boosterState.timeStep.value}с время вниз 20с
Отсечка: ${boosterState.minPressure.value}бар, ${boosterState.minVoltage.value}В, ${boosterState.maxTemp.value}\u00b0С
КЗ: ${boosterState.shortCircuitDuration.value}мс ${boosterState.shortCircuitDelay.value}с
  `;
}

function saveLog(boosterState) {
  writeTerminateMessage(boosterState);
  log.end();
}

function writeTerminateMessage(boosterState) {
  for (const key of Object.keys(SIGNALS)) {
    if (boosterState[key].value) writeLogData(SIGNALS[key]);
  }
  writeLogData(STOP_BITS[boosterState.stopBit.value]);
}

function writeLogData(row) {
  console.log(row);
  log.write(row);
  sockPool.forEach((sock) => sock.write(row));
}

module.exports = {
  createLog,
  writeRow,
  saveLog,
};
