const {dataGenerator} = require('../utils/dataGenerator');

test('generates data correctly', () => {
  const generatedArray = [...dataGenerator()];
  expect(generatedArray.length).toBe(5000);
  expect(generatedArray[0].length).toBe(4);
  expect(generatedArray[4][0]).toBe(4);
})