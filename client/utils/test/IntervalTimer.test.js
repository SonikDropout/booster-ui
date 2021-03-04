const IntervalTimer = require('../IntervalTimer');

test('timeout works with scope', (done) => {
  let a = 0;
  const intervalTimer = new IntervalTimer(
    () => a++,
    100,
    10,
    () => {
      expect(a).toBe(10);
      done();
    }
  );
  intervalTimer.pause();
  setTimeout(() => intervalTimer.resume(), 1000)
});
