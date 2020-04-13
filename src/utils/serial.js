const Serial = require('serialport');
const { PORT, SEPARATORS } = require('../constants');
const parse = require('./parser');
const EventEmitter = require('events');

const emitter = new EventEmitter();
const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });

serial.on('data', handleData);

let buffer = Buffer.from([]);

function handleData(buf) {
  if (buf.toString('ascii').startsWith('ok')) buf = buf.slice(2);
  idx = buf.indexOf(SEPARATORS);
  if (idx != -1) {
    buffer = Buffer.concat([buffer, buf.slice(0, idx)]);
    try {
      emitter.emit('data', parse(buffer));
    } catch (e) {
      // console.error('There is a hole in your logic:', e);
    }
    buffer = buf.slice(idx);
  } else {
    buffer = Buffer.concat([buffer, buf]);
  }
}

let commandQueue = [];
let portBusy = false;

function sendCommand(id, cmd) {
  const buf = Buffer.alloc(5);
  buf[0] = 40;
  buf[1] = id;
  buf.writeInt16BE(cmd, 2);
  buf[4] = id + cmd + 40;
  commandQueue.push(buf);
  if (!portBusy) {
    portBusy = true;
    writeCommandFromQueue();
  }
}

function writeCommandFromQueue() {
  if (!commandQueue.length) {
    portBusy = false;
    return;
  }
  const cmd = commandQueue.shift();
  console.log('Sending command to serial:', cmd);
  serial.write(cmd);
  serial.once('data', (buf) => {
    console.log('Recieved answer:', buf);
    if (!buf.toString('ascii').includes('ok')) {
      commandQueue.unshift(cmd);
    }
    writeCommandFromQueue();
  });
}

function close() {
  subscribers = [];
  if (serial.isOpen) serial.close();
}

emitter.close = close;
emitter.sendCommand = sendCommand;

module.exports = emitter;
