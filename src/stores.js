const { writable, derived } = require('svelte/store');
const { ipcRenderer } = require('electron');
const { clone } = require('./utils/helpers');
const { SERIAL_DATA } = require('./constants');
const { formatSeconds } = require('./utils/helpers');

const serialData = writable(clone(SERIAL_DATA));

const appInitialized = writable(false);

ipcRenderer
  .once('serialData', () => appInitialized.set(true))
  .on('serialData', (_, data) => serialData.set(data));

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
};
