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
    dataMap[PARAMS_DATA[j].name].value = +(
      buf[`read${PARAMS_DATA[j].singed ? '' : 'U'}Int16BE`](i) / 1000
    ).toPrecision(4);
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    dataMap[STATE_DATA[j].name].value = buf[i++];
  }
  dataMap.FCPower.value = Math.abs(
    dataMap.FCCurrent.value * dataMap.FCVoltage.value
  );
  return dataMap;
};
