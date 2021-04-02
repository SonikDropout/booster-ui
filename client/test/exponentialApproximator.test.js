const {
  approximate,
  solveTwoLinearEquations,
} = require('../utils/exponentialApproxiamator');

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
  const points = [
    {x: 648, y: 5 },
    {x: 1037, y: 10.4 },
    {x: 1343, y: 16.1 },
    {x: 1640, y: 24 },
    {x: 1805, y: 30.3 },
    {x: 1957, y: 38.6 },
    {x: 2083, y: 47.8 },
  ];
  const [a, b] = approximate(points);
  expect(a).toBeCloseTo(1.99);
  expect(b).toBeCloseTo(0.00151);
});
