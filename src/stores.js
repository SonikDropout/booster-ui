const { writable, derived } = require('svelte/store');
const { ipcRenderer } = require('electron');
const { clone } = require('./utils/helpers');
const { SERIAL_DATA } = require('./constants');
const { formatSeconds } = require('./utils/helpers');
const { isLoading } = require('./utils/translator');

const settings = writable(ipcRenderer.sendSync('getSettings'));

const algorithm = writable(ipcRenderer.sendSync('getScript'));

settings.subscribe((s) => ipcRenderer.send('updateSettings', s));
algorithm.subscribe((a) => ipcRenderer.send('updateAlgorithm', a));

const serialData = writable(clone(SERIAL_DATA));

const appInitialized = writable(false);

const localeLoaded = new Promise(
  (res) => void isLoading.subscribe((f) => (f ? void 0 : res()))
);
const serialRecieved = new Promise(
  (res) => void ipcRenderer.once('serialData', res)
);

Promise.all([localeLoaded, serialRecieved]).then(() =>
  appInitialized.set(true)
);

ipcRenderer.on('serialData', (_, data) => serialData.set(data));

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
