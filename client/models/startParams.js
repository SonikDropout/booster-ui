const { COMMANDS } = require('../../common/constants');

const removedEntries = [
  'startCalibration',
  'shortCircuitDuration',
  'shortCircuitDelay',
  'boostMode',
  'stabilizationTemp',
];

module.exports = Object.keys(COMMANDS).filter(
  (key) => !removedEntries.includes(key)
);
