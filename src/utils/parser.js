const {
  SEPARATORS,
  PARAMS_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
  SERIAL_DATA,
} = require('../constants');
const { clone } = require('./others');

const dataMap = clone(SERIAL_DATA);

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0 || buffer.length != DATA_BYTE_LENGTH)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  let i = 0;
  let checkSum = 0;
  while (i < SEPARATORS.length) {
    checkSum += buf.readUInt16BE(i);
    i += 2;
  }
  for (let j = 0; j < PARAMS_DATA.length; j++) {
    const { name, divider = 1 } = PARAMS_DATA[j];
    let value = +(buf.readInt16BE(i) / divider).toPrecision(4);
    dataMap[name].value = value;
    checkSum += value;
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    checkSum += buf[i];
    dataMap[STATE_DATA[j].name].value = buf[i++];
  }
  if (checkSum % Math.pow(2, 16) != buf.readUInt16BE(i)) {
    throw new Error("Check sums don't match");
  }
  dataMap.FCPower.value = +Math.abs(
    dataMap.FCCurrent.value * dataMap.FCVoltage.value
  ).toPrecision(4);
  return dataMap;
};
