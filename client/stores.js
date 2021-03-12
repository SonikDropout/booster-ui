const { writable, derived } = require('svelte/store');
const { clone } = require('../common/helpers');
const { SERIAL_DATA } = require('../common/constants');
const { isLoading } = require('./utils/translator');
const client = require('./utils/wsClient');

const settings = writable({});
const initialize = writable({});
const algorithm = writable([]);

const notification = writable();

const post = (path) => (body) =>
  void fetch(path, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.text())
    .then((res) => {
      if (res === 'OK') {
        notification.set({
          type: 'info',
          message: 'save success',
          timeout: 3000,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      notification.set({
        type: 'error',
        message: 'save failed',
        timeout: 3000,
      });
    });

const ignoreFirstCall = (fn) => {
  let firstCall = true;
  return (...args) => {
    if (firstCall) firstCall = false;
    else fn(...args);
  };
};

function subscribeSettings() {
  settings.subscribe(ignoreFirstCall(post('./config/settings')));
}
function subscribeAlgorithm() {
  algorithm.subscribe(ignoreFirstCall(post('./config/algorithm')));
}
function subscribeInitialize() {
  initialize.subscribe(ignoreFirstCall(post('./config/initialize')));
}

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
const initializePromise = fetch('./config/initialize')
  .then((r) => r.json())
  .then(initialize.set)
  .then(subscribeInitialize);

const connectionEstablished = new Promise((resolve, reject) => {
  client.once('serial data', resolve);
  client.on('connect_error', reject);
});

Promise.all([
  settingsPromise,
  algorithmPromise,
  initializePromise,
  localeLoaded,
  connectionEstablished,
])
  .then(() => {
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
  initialize,
  notification,
};
