const { formatSeconds, getNested } = require('../helpers');

test('formatting seconds correctly', () => {
  expect(formatSeconds(3721)).toBe('01:02:01');
});

test('retrieves value form nested object correctly', () => {
  const obj = { a: { b: { c: 0 } } };
  expect(getNested(obj, 'a.b.c')).toBe(0);
  expect(getNested(obj, 'a.d.e')).toBe(void 0);
});
