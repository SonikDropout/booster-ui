const { writable, derived } = require('svelte/store');
const { ipcRenderer } = require('electron');
const { clone } = require('./utils/others');
const { SERIAL_DATA } = require('./constants');
const { formatSeconds } = require('./utils/others');

const serialData = writable(clone(SERIAL_DATA));

const appInitialized = writable(false);

let lastExperiment;

function updateLastExperimentNumber() {
  serialData.subscribe(($data) => {
    lastExperiment = $data.experimentNumber.value;
  })();
}

const experimentError = derived(serialData, ($data) => {
  if (!$data.start.value && lastExperiment === $data.experimentNumber.value)
    return true;
  if ($data.start.value) updateLastExperimentNumber();
});

ipcRenderer
  .once('serialData', () => appInitialized.set(true))
  .on('serialData', (_, data) => serialData.set(data));

function getValue(store) {
  let $val;
  store.subscribe(($) => ($val = $))();
  return $val;
}

let elapsed = 0;
let isOn = false;
const timerElement = document.getElementById('timer');
serialData.subscribe(displayElapsedTime);

function displayElapsedTime($dat) {
  if ($dat.start.value) {
    if (!isOn) {
      elapsed = 0;
      isOn = true;
    }
    elapsed++;
  } else isOn = false;
  timerElement.innerText = formatSeconds(elapsed);
}

module.exports = {
  serialData,
  appInitialized,
  experimentError,
  getValue,
};
