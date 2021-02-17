exports.approximate = function approximate(points) {
  if (points.length < 5) throw new Error('Too few points to approximate!');
  return getExpCoefficients(points);
};

function getExpCoefficients(points) {
  const X = points.map((p) => p.x);
  const Y = points.map((p) => Math.log(p.y));
  const sumX = X.reduce((sum, x) => sum + x, 0);
  const sumY = Y.reduce((sum, y) => sum + y, 0);
  const sumXY = X.reduce((sum, x, i) => sum + x * Y[i], 0);
  const sumX2 = X.reduce((sum, x) => sum + x * x, 0);
  const [a1, a0] = solveTwoLinearEquations(
    [
      [sumX2, sumX],
      [sumX, points.length],
    ],
    [sumXY, sumY]
  );
  return [Math.exp(a0), a1];
}

function solveTwoLinearEquations(A, b) {
  const x2 =
    (A[0][0] * b[1] - b[0] * A[1][0]) /
    (A[1][1] * A[0][0] - A[0][1] * A[1][0]);
  const x1 = (b[0] - A[0][1] * x2) / A[0][0];
  return [x1, x2];
}
exports.solveTwoLinearEquations = solveTwoLinearEquations;
