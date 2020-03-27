const fs = require('fs');
const homeDir = require('os').homedir;
const path = require('path');
const { getFileDate, zip } = require('./others');
const { LOGGED_VALUES, SERIAL_DATA } = require('../constants');

let log;

const logHeader = LOGGED_VALUES.map(
  key => `${SERIAL_DATA[key].label}, ${SERIAL_DATA[key].units || ''}`
);
logHeader.unshift('Время');

function createLog() {
  log = fs.createWriteStream(
    path.join(homeDir, 'Documents', `log${getFileDate()}.tsv`)
  );
  log.write(logHeader.join('\t'));
}

function writeRow(row) {
  log.write(
    zip(numbers, units)
      .concat('\n')
      .join('\t')
  );
}

function saveLog() {
  log.end();
  log = void 0;
}

module.exports = {
  createLog,
  writeRow,
  saveLog,
};
