const IntervalTimer = require('./IntervalTimer');

class Executor {
  constructor(callback) {
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

  async start(algorithm) {
    this.running = true;
    for (const step of algorithm) {
      for (let i = 0; i < step.loop; ++i) {
        await this.executeStep(step);
      }
    }
  }

  async executeStep(stepOptions) {
    switch (stepOptions.direction) {
      case 'down':
        await this.changeValue(stepOptions, true);
        break;
      case 'up':
        await this.changeValue(stepOptions);
        break;
      case 'hold':
        await this.holdValue(stepOptions);
        break;
      case 'downup':
        await this.decIncValue(stepOptions);
        break;
      default:
        throw new Error('Unknow algorithm step type');
    }
  }
  async changeValue({ param, min, max, step, stepTime }, isDecrement) {
    let value = isDecrement ? max : min;
    const stepsCount = Math.round((max - min) / step);
    await this._executeInerval(
      () => {
        this.callback(param, value);
        value = value + (isDecrement ? -step : step);
      },
      stepTime * 1000,
      stepsCount
    );
  }
  async decIncValue(stepOptions) {
    await this.changeValue(stepOptions, true);
    await this.changeValue(stepOptions);
  }
  async holdValue({ param, value, time }) {
    await this._executeInerval(
      () => this.callback(param, value),
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
