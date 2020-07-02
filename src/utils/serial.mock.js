const EventEmitter = require('events');
const { SERIAL_DATA } = require('../constants');
const { clone } = require('./others');

const emitter = new EventEmitter();

let interval = setInterval(sendData, 1000);

const dataMap = clone(SERIAL_DATA);
for (const key in dataMap) dataMap[key].value = 0;
dataMap.boostMode.value = 1;

// delayStart();

function delayStop() {
  setTimeout(() => {
    dataMap.stopPressed.value = 1;
    dataMap.start.value = 0;
    delayStart();
  }, 5000);
}

function delayStart() {
  setTimeout(() => {
    dataMap.stopPressed.value = 0;
    dataMap.start.value = 1;
    delayStop();
  }, 3000)
}

function sendData() {
  emitter.emit('data', generateData());
}

function generateData() {
  for (const key of ['FCVoltage', 'FCCurrent', 'FCPower'])
    dataMap[key].value = +(Math.random() * 100).toFixed(3);
  return dataMap;
}

emitter.sendCommand = (id, cmd) => {
  const buf = Buffer.from([40, id, 0, 0, id + cmd + 40]);
  buf.writeInt16BE(cmd, 2);
  console.info('Sending command to serial:', buf);
};

emitter.close = () => {
  emitter.removeAllListeners;
  clearInterval(interval);
};

module.exports = emitter;
