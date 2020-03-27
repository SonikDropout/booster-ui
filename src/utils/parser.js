const {
  SEPARATORS,
  PARAMS_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
} = require('../constants');

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0 /*|| buffer.length != DATA_BYTE_LENGTH*/)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  const result = [];
  let i = SEPARATORS.length;
  for (let j = 0; j < PARAMS_DATA.length; j++) {
    result.push(+(buf.readInt16BE(i) / 1000).toPrecision(4));
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    result.push(buf[i++]);
  }
  return result;
};
