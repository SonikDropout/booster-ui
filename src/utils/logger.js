const fs = require('fs');
const homeDir = require('os').homedir;
const path = require('path');
const { getFileDate, zip } = require('./others');
const { LOGGED_VALUES, SERIAL_DATA } = require('../constants');

let log;

const tableHeader = LOGGED_VALUES.map(
  key => `${SERIAL_DATA[key].label}, ${SERIAL_DATA[key].units || ''}`
);
tableHeader.unshift('Время');

function createLog(boosterState) {
  log = fs.createWriteStream(
    path.join(homeDir, 'Documents', `log${getFileDate()}.tsv`)
  );
  logWrite(generateLogHeader(boosterState));
  log.write(tableHeader.concat('\n').join('\t'));
}

function writeRow(row) {
  log.write(
    zip(numbers, units)
      .concat('\n')
      .join('\t')
  );
}

function generateLogHeader(boosterState) {
  return `
Старт
${boosterState.boostMode}
Номер блока ${blockNumber}
Номер эксперимента ${boosterState.experimentNumber}
Авторазгон от ${boosterState.startCurrent} до ${boosterState.endCurrent} с шагом ${boosterState.currentStep}, время вверх ${boosterState.timeStep}сб время вниз 20с
Отсечка: ${boosterState.maxPressure}бар, ${boosterState.maxVoltage}В, ${boosterState.maxTemp}\u00b0С
КЗ: ${boosterState.shortCircuitDuration}мс ${boosterState.shortCircuitDelay}с
  `;
}

function saveLog(boosterState) {
  writeTerminateMessage(boosterState);
  log.end();
  log = void 0;
}

function writeTerminateMessage(boosterState) {
  for (const signal of [35, 36, 37, 39]) {
    log.write(SIGNALS[signal]);
  }
  switch (boosterState[38]) {
    case 1:
      log.write('Разгон завершен, снятие ВАХ\n');
    case 2:
      log.write('Снятие ВАХ завершено, холостой ход\n');
    case 3:
      log.write('Окончание авторазгона\n\n\n\n');
  }
}

module.exports = {
  createLog,
  writeRow,
  saveLog,
};
