module.exports = {
  rows: [],
  points: [],
  xIdx: 0,
  yIdx: 1,
  addRow(row) {
    this.rows.push(row);
    this.points.push({ x: row[this.xIdx], y: row[this.yIdx] });
    if (this.points.length > 1000) this.downsamplePoints();
  },
  downsamplePoints() {
    let divider = Math.round(this.rows.length / 500);
    this.points = [];
    for (let i = 0; i < this.rows.length; ++i) {
      if (!(i % divider))
        this.points.push({
          x: this.rows[i][this.xIdx],
          y: this.rows[i][this.yIdx],
        });
    }
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
    this.points = this.rows.map((row) => ({
      x: row[this.xIdx],
      y: row[this.yIdx],
    }));
    if (this.points.length > 1000) this.downsamplePoints();
  },
  drain() {
    this.rows = [];
    this.points = [];
  },
};
