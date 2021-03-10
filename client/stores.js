const { writable, derived } = require('svelte/store');
const { clone } = require('../common/helpers');
const { SERIAL_DATA } = require('../common/constants');
const { isLoading } = require('./utils/translator');
const client = require('./utils/wsClient');

const settings = writable({});

const algorithm = writable([]);

const subscribeSettings = () =>
  settings.subscribe((s) =>
    fetch('./config/settings', {
      method: 'post',
      body: JSON.stringify(s),
    }).catch(console.error)
  );
const subscribeAlgorithm = () =>
  algorithm.subscribe((a) =>
    fetch('./config/algorithm', {
      method: 'post',
      body: JSON.stringify(a),
    }).catch(console.error)
  );

const serialData = writable(clone(SERIAL_DATA));

const appInitialized = writable(false);

const localeLoaded = new Promise(
  (res) => void isLoading.subscribe((f) => (f ? void 0 : res()))
);
const settingsPromise = fetch('./config/settings')
  .then((r) => r.json())
  .then(settings.set)
  .then(subscribeSettings);
const algorithmPromise = fetch('./config/algorithm')
  .then((r) => r.json())
  .then(algorithm.set)
  .then(subscribeAlgorithm);

const connectionEstablished = new Promise((resolve, reject) => {
  client.once('serial data', resolve);
  client.once('serial data', console.log);
  client.on('connect_error', reject);
});

Promise.all([
  settingsPromise,
  algorithmPromise,
  localeLoaded,
  connectionEstablished,
])
  .then(([s, a]) => {
    settings.set(s);
    algorithm.set(a);
    appInitialized.set(true);
  })
  .catch(console.error);

client.on('serial data', serialData.set);

function getValue(store) {
  let $val;
  store.subscribe(($) => ($val = $))();
  return $val;
}

let elapsed = 0,
  timeStart;

const elapsedStore = derived(serialData, (d) => {
  if (d.start.value) {
    if (!timeStart) timeStart = Date.now();
    elapsed = Math.round((Date.now() - timeStart) / 1000);
  } else {
    timeStart = 0;
    elapsed = 0;
  }
  return elapsed;
});

module.exports = {
  serialData,
  appInitialized,
  getValue,
  settings,
  elapsed: elapsedStore,
  algorithm,
};
