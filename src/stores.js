const { writable, derived } = require('svelte/store');
const { ipcRenderer } = require('electron');
const { clone } = require('./utils/others');
const { SERIAL_DATA } = require('./constants');
const { formatSeconds } = require('./utils/others');

const dataMap = clone(SERIAL_DATA);

const dataKeys = Object.keys(dataMap);
const serialData = writable(dataMap);

const appInitialized = writable(false);

const experiementError = derived(
  [serialData, lastExperiment],
  ([$data, $exp]) => $data.start && $exp === $data.experimentNumber
);

const lastExperiment = derived(
  serialData,
  $data => $data.stopPressed ? $data.experimentNumber : void 0
);


ipcRenderer
  .once('serialData', () => appInitialized.set(true))
  .on('serialData', handleSerialData);

function handleSerialData(event, arr) {
  for (let i = 0; i < dataKeys.length; ++i) {
    dataMap[dataKeys[i]].value = arr[i] || 0;
  }
  serialData.set(dataMap);
}

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
