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
  if (buffer.indexOf(SEPARATORS) != 0 /*|| buffer.length != DATA_BYTE_LENGTH*/)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  let i = SEPARATORS.length;
  for (let j = 0; j < PARAMS_DATA.length; j++) {
    const { name, divider = 1 } = PARAMS_DATA[j];
    dataMap[name].value = +(buf.readInt16BE(i) / divider).toPrecision(4);
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    dataMap[STATE_DATA[j].name].value = buf[i++];
  }
  dataMap.FCPower.value = +Math.abs(
    dataMap.FCCurrent.value * dataMap.FCVoltage.value
  ).toPrecision(4);
  return dataMap;
};
