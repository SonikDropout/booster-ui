const { COMMANDS } = require('../../common/constants');

const removedEntries = [
  'startCalibration',
  'shortCircuitDuration',
  'shortCircuitDelay',
  'boostMode',
];

module.exports = Object.keys(COMMANDS).filter(
  (key) => !removedEntries.includes(key)
);
