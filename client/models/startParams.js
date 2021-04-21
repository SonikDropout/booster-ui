const { COMMANDS } = require('../../common/constants');

const removedEntries = [
  'startCalibration',
  'boostMode',
  'stabilizationTemp',
];

module.exports = Object.keys(COMMANDS).filter(
  (key) => !removedEntries.includes(key)
);
