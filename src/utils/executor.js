const { CONFIG_PATH, COMMANDS } = require('../constants');
const IntervalTimer = require('./IntervalTimer');
const algorithm = require(CONFIG_PATH).executionAlgorithm;

function changeVoltage(direction) {
  return function decrementVoltage(
    serial,
    { minVoltage, maxVoltage, step, stepTime }
  ) {
    let voltage = direction == 'down' ? maxVoltage : minVoltage;
    const stepsCount = Math.round((maxVoltage - minVoltage) / step);
    return new Promise((resolve, reject) => {
      let stepInterval = new IntervalTimer(
        () => {
          voltage -= direction == 'down' ? step : -step;
          serial.sendCommand(...COMMANDS.load(voltage));
        },
        stepTime * 1000,
        stepsCount,
        () => {
          resolve();
          serial.removeAllListeners('executionPaused');
          serial.removeAllListeners('executionResumed');
          serial.removeAllListeners('executionRejected');
        }
      );
      serial.on('executionPaused', stepInterval.pause);
      serial.on('executionResumed', stepInterval.resume);
      serial.once('executionRejected', () => {
        stepInterval.clear();
        serial.removeAllListeners('executionPaused');
        serial.removeAllListeners('executionResumed');
        reject();
      });
    });
  };
}

module.exports = async function (serial) {
  serial.sendCommand(...COMMANDS.loadMode(1));
  for (const step of algorithm) {
    for (let i = 0; i < step.loop; ++i) {
      await changeVoltage('down')(serial, step);
      if (step.direction.endsWith('up'))
        await changeVoltage('up')(serial, step);
      else serial.sendCommand(...COMMANDS.load(step.maxVoltage));
    }
  }
};
