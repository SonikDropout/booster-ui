const { CONFIG_PATH, COMMANDS } = require('../constants');
const algorithm = require(CONFIG_PATH).executionAlgorithm;

function decrementVoltage(serial, { minVoltage, maxVoltage, step, stepTime }) {
  let voltage = maxVoltage;
  return new Promise((resolve, reject) => {
    let stepInterval = setInterval(() => {
      voltage -= step;
      serial.sendCommand(...COMMANDS.load(voltage));
      if (voltage <= minVoltage) {
        clearInterval(stepInterval);
        resolve();
      }
    }, stepTime * 1000);
    serial.on('executionRejected', () => {
      clearInterval(stepInterval);
      reject();
    });
  });
}

function incrementVoltage(serial, { minVoltage, maxVoltage, step, stepTime }) {
  let voltage = minVoltage;
  return new Promise((resolve, reject) => {
    let stepInterval = setInterval(() => {
      voltage += step;
      serial.sendCommand(...COMMANDS.load(voltage));
      if (voltage >= maxVoltage) {
        clearInterval(stepInterval);
        resolve();
      }
    }, stepTime * 1000);
    serial.on('executionRejected', () => {
      clearInterval(stepInterval);
      reject();
    });
  });
}

function reset(serial, { maxVoltage }) {
  return new Promise((resolve, reject) => {
    serial.sendCommand(...COMMANDS.load(maxVoltage));
    let continueTimeout = setTimeout(resolve, 1000);
    serial.on('executionRejected', () => {
      clearTimeout(continueTimeout);
      reject();
    });
  });
}

module.exports = async function (serial) {
  serial.sendCommand(...COMMANDS.loadMode(1));
  for (const step of algorithm) {
    for (let i = 0; i < step.loop; ++i) {
      await decrementVoltage(serial, step);
      if (step.direction.endsWith('up')) await incrementVoltage(serial, step);
      else await reset(serial, step);
    }
  }
};
