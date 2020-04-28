module.exports = {
  rows: [],
  points: [],
  xIdx: 0,
  yIdx: 1,
  addRow(row) {
    this.rows.push(row);
    this.points.push({x: row[this.xIdx], y: row[this.yIdx]})
  },
  setX(i) {
    this.xIdx = i;
    this.updatePoints();
  },
  setY(i) {
    this.yIdx = i;
    this.updatePoints();
  },
  updatePoints() {
    this.points = this.rows.map(row => ({x: row[this.xIdx], y: row[this.yIdx]}))
  },
  drain() {
    this.rows = [];
    this.points = [];
  },
};
