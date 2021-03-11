const Executor = require('../Executor');

const executor = new Executor(
  [
    {
      minVoltage: 2,
      maxVoltage: 3,
      step: 0.1,
      stepTime: 1,
      direction: 'up',
      loop: 2,
    },
  ],
  console.log
);
executor.start();
setTimeout(() => {
  executor.pause()
  executor.resume()
});
