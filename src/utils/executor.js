const IntervalTimer = require('./IntervalTimer');

class Executor {
  constructor(algorithm, callback) {
    this.algorithm = algorithm;
    this.callback = callback;
    this.running = false;
    this.bindMethods();
  }

  bindMethods() {
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.abort = this.abort.bind(this);
    this.start = this.start.bind(this);
  }

  async start() {
    this.running = true;
    for (const step of this.algorithm) {
      for (let i = 0; i < step.loop; ++i) {
        await this.executeStep(step);
      }
    }
  }

  async executeStep(step) {
    switch (step.direction) {
      case 'down':
        await this.decrementVoltage(step);
        break;
      case 'up':
        await this.incrementVoltage(step);
        break;
      case 'hold':
        await this.holdLoad(step);
        break;
      case 'downup':
        await this.decIncVoltage(step);
        break;
      default:
        throw new Error('Unknow algorithm step type');
    }
  }
  async decrementVoltage({ minVoltage, maxVoltage, step, stepTime }) {
    let voltage = maxVoltage;
    const stepsCount = Math.round((maxVoltage - minVoltage) / step);
    await this._executeInerval(
      () => {
        this.callback({ voltage });
        voltage -= step;
      },
      stepTime * 1000,
      stepsCount
    );
  }
  async incrementVoltage({ minVoltage, maxVoltage, step, stepTime }) {
    let voltage = minVoltage;
    const stepsCount = Math.round((maxVoltage - minVoltage) / step);
    await this._executeInerval(
      () => {
        this.callback({ voltage });
        voltage += step;
      },
      stepTime * 1000,
      stepsCount
    );
  }
  async decIncVoltage(step) {
    await this.decrementVoltage(step);
    await this.incrementVoltage(step);
  }
  async holdLoad({ voltage, current, time }) {
    await this._executeInerval(
      () => this.callback({ voltage, current }),
      time * 1000,
      1
    );
  }
  _executeInerval(cb, ms, loops) {
    cb();
    return new Promise((resolve, reject) => {
      this.stepInterval = new IntervalTimer(cb, ms, loops, resolve, reject);
    });
  }
  pause() {
    this.stepInterval.pause();
    this.running = false;
  }
  resume() {
    this.stepInterval.resume();
    this.running = true;
  }
  abort() {
    this.stepInterval.clear();
    this.running = false;
  }
}

module.exports = Executor;
