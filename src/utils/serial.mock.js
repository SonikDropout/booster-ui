const EventEmitter = require('events');
const { STATE_DATA, PARAMS_DATA } = require('../constants');

const emitter = new EventEmitter();

let interval = setInterval(sendData, 1000);

function sendData() {
  emitter.emit('data', getRandomData());
}

function getRandomData() {
  return Array(STATE_DATA.length + PARAMS_DATA.length).fill(0);
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
