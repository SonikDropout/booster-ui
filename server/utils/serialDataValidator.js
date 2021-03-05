const { SEPARATORS } = require('../globals');
const {
  DATA_BYTE_LENGTH,
  PARAMS_DATA,
  STATE_DATA,
} = require('../../common/constants');

module.exports = function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0 || buffer.length != DATA_BYTE_LENGTH)
    throw new Error('Invalid buffer recieved');
  let i = 0;
  let checkSum = 0;
  while (i < SEPARATORS.length + PARAMS_DATA.length) {
    checkSum += buf.readInt16BE(i);
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    checkSum += buf[i++];
  }
  checkSum = checkSum % Math.pow(2, 16);
  if (checkSum != buf.readUInt16BE(i)) {
    throw new Error(
      `Check sums don't match calculated: ${checkSum}, recieved: ${buf.readUInt16BE(
        i
      )}`
    );
  }
};
