const { SEPARATORS } = require('../globals');
const {
  PARAMS_DATA,
  SERIAL_DATA,
  DATA_BYTE_LENGTH,
  STATE_DATA,
} = require('../../common/constants');
const { clone } = require('../../common/helpers');
const { Ka, Kb } = require('./configManager').getSettings();

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
    dataMap[name].value = +(buf.readInt16BE(i) / divider).toPrecision(4);
    checkSum += buf.readInt16BE(i);
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    checkSum += buf[i];
    dataMap[STATE_DATA[j].name].value = buf[i++];
  }
  dataMap.start.value = dataMap.start.value !== 127;
  checkSum = checkSum % Math.pow(2, 16);
  if (checkSum != buf.readUInt16BE(i)) {
    throw new Error(
      `Check sums don't match calculated: ${checkSum}, recieved: ${buf.readUInt16BE(
        i
      )}`
    );
  }
  dataMap.FCPower.value = +Math.abs(
    dataMap.FCCurrent.value * dataMap.FCVoltage.value
  ).toPrecision(4);
  const hydrogenConsumption = dataMap.hydrogenConsumption.value
  dataMap.hydrogenConsumption.raw = hydrogenConsumption;
  dataMap.hydrogenConsumption.value = Ka * Math.exp(Kb * hydrogenConsumption);
  return dataMap;
};
