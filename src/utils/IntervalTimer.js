module.exports = class IntervalTimer {
  constructor(cb, interval, loops, done) {
    this.state = 'running';
    this.loops = loops;
    this.ms = interval;
    this.cb = cb;
    this.done = done;
    this._bindAll();
    this._start();
  }
  pause() {
    if (this.state != 'running') return;
    this.clear();
    this.state = 'paused';
  }
  resume() {
    if (this.state != 'paused') return;
    this._start();
    this.state = 'running';
  }
  clear() {
    clearInterval(this.interval);
  }
  _start() {
    this.interval = setInterval(this._callback, this.ms);
  }
  _finish() {
    clearInterval(this.interval);
    this.done();
  }
  _callback() {
    this.cb();
    if (!--this.loops) this._finish();
  }
  _bindAll() {
    this._finish = this._finish.bind(this);
    this._callback = this._callback.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.clear = this.clear.bind(this);
  }
};
