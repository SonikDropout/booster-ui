const { writable, derived } = require('svelte/store');
const { ipcRenderer } = require('electron');
const { clone } = require('./utils/others');
const { SERIAL_DATA } = require('./constants');
const { formatSeconds } = require('./utils/others');

const serialData = writable();

const appInitialized = writable(false);

let lastExperiment;

const unsub = serialData.subscribe($data => {
  if ($data.stopPressed) {
    lastExperiment = $data.experimentNumber;
    unsub();
  }
});

const experiementError = derived(
  serialData,
  $data => $data.start.value && lastExperiment === $data.experimentNumber
);

ipcRenderer
  .once('serialData', () => appInitialized.set(true))
  .on('serialData', (_, data) => serialData.set(data));

function getValue(store) {
  let $val;
  store.subscribe($ => ($val = $))();
  return $val;
}

let elapsed = 0;
const timerElement = document.getElementById('timer');
serialData.subscribe(displayElapsedTime);

function displayElapsedTime($dat) {
  if ($dat.start.value) elapsed++;
  else elapsed = 0;
  timerElement.innerText = formatSeconds(elapsed);
}

module.exports = {
  serialData,
  appInitialized,
  experiementError,
  getValue,
};
