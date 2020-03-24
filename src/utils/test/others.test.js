const { formatSeconds } = require('../others');

test('formatting seconds correctly', () => {
  expect(formatSeconds(3721)).toBe('01:02:01');
});
