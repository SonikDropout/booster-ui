const { writable, derived } = require('svelte/store');
const { ipcRenderer } = require('electron');
const { clone } = require('./utils/helpers');
const { SERIAL_DATA } = require('./constants');
const { formatSeconds } = require('./utils/helpers');
const { isLoading } = require('./utils/translator');

const settings = writable(ipcRenderer.sendSync('getSettings'));

settings.subscribe((s) => ipcRenderer.send('updateSettings', s));

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
const timerElement = document.getElementById('timer');
serialData.subscribe(displayElapsedTime);

function displayElapsedTime($dat) {
  if ($dat.start.value) {
    if (!timeStart) {
      timeStart = Date.now();
    }
    elapsed = Math.round((Date.now() - timeStart) / 1000);
  } else timeStart = void 0;
  timerElement.innerText = formatSeconds(elapsed);
}

module.exports = {
  serialData,
  appInitialized,
  getValue,
  settings,
};
