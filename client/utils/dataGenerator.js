function* dataGenerator() {
  for (let i = 0; i < 5000; ++i) {
    yield [
      i,
      ...Array.from({ length: 3 }, () => +(Math.random() * 100).toFixed(3)),
    ];
  }
}

module.exports = { dataGenerator };
