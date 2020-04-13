const EventEmitter = require('events');
const { SERIAL_DATA } = require('../constants');
const { clone } = require('./others');

const emitter = new EventEmitter();

let interval = setInterval(sendData, 1000);

const dataMap = clone(SERIAL_DATA);
for (const key in dataMap) dataMap[key].value = 0;

function sendData() {
  emitter.emit('data', dataMap);
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
