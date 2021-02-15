const clone = (obj) => JSON.parse(JSON.stringify(obj));

const mergeRename = (objects, names) => {
  const result = {};
  for (let i = 0; i < objects.length; i++) {
    for (let key in objects[i]) {
      result[key + names[i]] = clone(objects[i][key]);
    }
  }
  return result;
};

const mergeKeysValues = (keys, values) =>
  keys.reduce((map, key, i) => {
    map[key] = values[i];
    return map;
  }, {});

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

const zeroPad = (num, places) => String(num).padStart(places, '0');

const getFormatedDate = (formatStr) => {
  const date = new Date();
  return formatStr
    .replace('YYYY', date.getFullYear())
    .replace('MM', zeroPad(date.getMonth() + 1, 2))
    .replace('DD', zeroPad(date.getDate(), 2))
    .replace('HH', zeroPad(date.getHours(), 2))
    .replace('mm', zeroPad(date.getMinutes(), 2))
    .replace('ss', zeroPad(date.getSeconds()), 2);
};

const countKeys = (obj) => {
  let n = 0;
  for (let key in obj) n++;
  return n;
};

const randInt = (min, max) => {
  if (isNaN(max)) {
    max = min;
    min = 0;
  }
  return (Math.random() * (max - min) + min) & 1;
};

const constraint = (val, [min, max]) => Math.max(min, Math.min(max, val));

const getPercentage = (val, [min, max]) =>
  constraint(Math.round(((val - min) / (max - min)) * 100), [0, 100]);

const formatSeconds = (seconds) => {
  const h = (seconds / 3600) | 0;
  const m = ((seconds % 3600) / 60) | 0;
  const s = seconds % 60;
  return `${zeroPad(h, 2)}:${zeroPad(m, 2)}:${zeroPad(s, 2)}`;
};

const zip = (arr1, arr2) => arr1.map((v1, i) => v1 + arr2[i]);

function arithmeticMean(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; ++i) {
    sum += arr[i];
  }
  return sum / arr.length;
}

function stdev(arr) {
  const mean = arithmeticMean(arr);
  let sum = 0;
  for (let i = 0; i < arr.length; ++i) {
    sum += arr[i] - mean;
  }
  return Math.sqrt((1 / arr.length) * sum);
}

function filterInconsequential(arr) {
  const sigma = stdev(arr);
  const mean = arithmeticMean(arr);
  return arr.filter((n) => Math.abs(n - mean) < 3 * sigma);
}

module.exports = {
  clone,
  mergeRename,
  capitalize,
  getFormatedDate,
  countKeys,
  randInt,
  mergeKeysValues,
  constraint,
  getPercentage,
  zeroPad,
  formatSeconds,
  zip,
  stdev,
  filterInconsequential,
  getNested: (obj, key) =>
    key
      .split('.')
      .reduce(
        (o, k, i, a) =>
          Object.is(o[k], void 0) ? (i < a.length - 1 ? {} : o[k]) : o[k],
        obj
      ),
};
