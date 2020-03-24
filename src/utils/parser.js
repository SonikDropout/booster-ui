const {
  SEPARATORS,
  IV_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
} = require('../constants');

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0 || buffer.length != DATA_BYTE_LENGTH)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  const result = { iv: [], state: [] };
  let i = SEPARATORS.length;
  for (let j = 0; j < IV_DATA.length; j++) {
    result.iv.push(+(buf.readUInt16BE(i) / 1000).toPrecision(4));
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    result.state.push(buf[i++]);
  }
  return result;
};
