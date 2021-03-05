const {
  SEPARATORS,
  PARAMS_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
  SERIAL_DATA,
} = require('../../common/constants');
const { clone } = require('../../common/helpers');

const dataMap = clone(SERIAL_DATA);

module.exports = function parse(bytes) {
  bytes = DataView(bytes);
  let i = 0;
  for (let j = 0; j < PARAMS_DATA.length; j++) {
    const { name, divider = 1 } = PARAMS_DATA[j];
    dataMap[name].value = +(bytes.getInt16(i) / divider).toPrecision(4);
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    dataMap[STATE_DATA[j].name].value = bytes.getUint8(i++);
  }
  dataMap.start.value = dataMap.start.value !== 127;
  dataMap.FCPower.value = +Math.abs(
    dataMap.FCCurrent.value * dataMap.FCVoltage.value
  ).toPrecision(4);
  return dataMap;
};
