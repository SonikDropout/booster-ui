const {
  approximate,
  solveTwoLinearEquations,
} = require('../exponentialApproxiamator');

test('solves linear equations correctly', () => {
  expect(
    solveTwoLinearEquations(
      [
        [1, 1],
        [1, 2],
      ],
      [3, 4]
    )
  ).toEqual([2, 1]);
});

test('approximates exponential function correctly', () => {
  const points = Array.from({ length: 5 }, (_, i) => ({
    x: i + 1,
    y: 2 * Math.exp(2 * (i + 1)),
  }));
  const [a, b] = approximate(points);
  expect(a).toBeCloseTo(2);
  expect(b).toBeCloseTo(2);
});
