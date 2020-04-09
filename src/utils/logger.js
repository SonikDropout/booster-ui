const fs = require('fs');
const homeDir = require('os').homedir;
const path = require('path');
const { getFormatedDate } = require('./others');
const { LOGGED_VALUES, SERIAL_DATA } = require('../constants');

let log;

const tableHeader = LOGGED_VALUES.map(
  key => `${SERIAL_DATA[key].label}, ${SERIAL_DATA[key].units || ''}`
);
tableHeader.unshift('Время');

function createLog(boosterState) {
  log = fs.createWriteStream(
    path.join(
      homeDir,
      'Documents',
      `log_${getFormatedDate('YYYY-MM-DD_HH-mm-ss')}.tsv`
    )
  );
  logWrite(generateLogHeader(boosterState));
  log.write(tableHeader.concat('\n').join('\t'));
}

function writeRow(boosterState) {
  log.write(
    getLogRow(boosterState)
      .concat('\n')
      .join('\t')
  );
}

function getLogRow(boosterState) {
  const row = [getFormatedDate('YYYY:MM:DD HH:mm:ss')];
  row.push.apply(
    row,
    LOGGED_VALUES.map(
      key => `${boosterState[key].value}${boosterState[key].units}`
    )
  );
  row.push(boosterState.isBlow ? 'П' : '-');
  row.push(boosterState.isShortCircuit ? 'КЗ' : '-');
  return row;
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
    if (boosterState[key].value) log.write(SIGNALS[key]);
  }
  log.write(STOP_BITS[boosterState.stopBit]);
}

module.exports = {
  createLog,
  writeRow,
  saveLog,
};
