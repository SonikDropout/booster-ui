const path = require('path');
const fs = require('fs');
const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = {
  name: IS_RPI ? '/dev/ttyS0' : 'COM5',
  baudRate: 230400,
};

const CONFIG_PATH = IS_RPI
  ? '/home/pi/booster-ui/config'
  : path.join(__dirname, '..', 'config');

let isSmallBlock;

try {
  isSmallBlock =
    JSON.parse(fs.readFileSync(path.join(CONFIG_PATH, 'settings.json')))
      .size === 'small';
} catch (e) {
  //pass
}

const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(7589);
SEPARATORS.writeUInt16BE(3333, 2);

const STATE_DATA = [
  { label: 'Purge delay', units: 's', name: 'blowDelay', prefix: 'P ' },
  { label: 'Load mode', name: 'loadMode' },
  { label: 'Temperature stabilization', name: 'boostMode' },
  {
    label: 'Short circuit duration',
    units: 'ms',
    name: 'shortCircuitDuration',
    prefix: 'KZ ',
  },
  {
    label: 'Short circuit delay',
    units: 's',
    name: 'shortCircuitDelay',
    prefix: 'KZ ',
  },
  { label: 'Purge before short ciricuit', units: 's', name: 'blowBeforeShortCircuit' },
  { name: 'start' },
  { label: 'Was purged', name: 'isBlow' },
  { label: 'Was short-circuited', name: 'isShortCircuit' },
  { name: 'tempError' },
  { name: 'pressureError' },
  { name: 'voltageError' },
  { name: 'stopPressed' },
];

const TERMINATE_SIGNALS = STATE_DATA.slice(-4).map((v) => v.name);

const PARAMS_DATA = [
  {
    label: 'Purge duration',
    units: 'ms',
    name: 'blowDuration',
    prefix: 'P ',
  },
  { label: 'Temperature 1', units: 'C', name: 'temp1', divider: 10 },
  { label: 'Temperature 2', units: 'C', name: 'temp2', divider: 10 },
  { label: 'Temperature 3', units: 'C', name: 'temp3', divider: 10 },
  { label: 'Temperature 4', units: 'C', name: 'temp4', divider: 10 },
  { label: 'Temperature 5', units: 'C', name: 'temp5', divider: 10 },
  {
    label: 'Fan load',
    units: '%',
    name: 'fanLoad',
    divider: 10,
  },
  {
    label: 'Stabilizaion temperature',
    units: '\u00b0C',
    name: 'stabilizationTemp',
    divider: 10,
  },
  {
    label: 'Voltage',
    units: 'V',
    name: 'FCVoltage',
    divider: 100,
    signed: true,
  },
  { label: 'Current', units: 'A', name: 'FCCurrent', divider: 1000, signed: true },
  {
    label: 'H2 pressure',
    units: 'bar',
    name: 'hydrogenPressure',
    divider: 1000,
  },
  { label: 'Load', name: 'load', divider: 10 },
  {
    label: 'Radiator T1',
    units: 'C',
    name: 'radiatorTemp1',
    divider: 10,
  },
  {
    label: 'Radiator T2',
    units: 'C',
    name: 'radiatorTemp2',
    divider: 10,
  },
  { label: 'Min fan RPM', units: 'ob/min', name: 'fanMinRPM' },
  {
    label: 'Max temperature',
    units: 'C',
    name: 'maxTemp',
    divider: 10,
  },
  {
    label: 'Min pressure',
    units: 'bar',
    name: 'minPressure',
    divider: 1000,
    signed: true,
  },
  {
    label: 'Min voltage',
    units: 'V',
    name: 'minVoltage',
    sined: true,
    divider: 10,
  },
  {
    label: 'H2 consumption',
    units: 'ml/min',
    name: 'hydrogenConsumption',
    sined: true,
  },
];

const DATA_BYTE_LENGTH =
  STATE_DATA.length + PARAMS_DATA.length * 2 + SEPARATORS.length + 2;

const COMMANDS = {
  loadMode: (v) => [4, v],
  boostMode: (v) => [8, v],
  blowDelay: (v) => [12, v],
  blowDuration: (v) => [16, v],
  fanLoad: (v) => [24, (v * 10) | 0],
  stabilizationTemp: (v) => [28, v],
  load: (v) => [32, (v * 10) | 0],
  fanMinRPM: (v) => [36, (v * 10) | 0],
  maxTemp: (v) => [48, v * 10],
  minPressure: (v) => [52, (v * 1000) | 0],
  minVoltage: (v) => [56, (v * 10) | 0],
  startCalibration: () => [80, 0],
  shortCircuitDuration: (v) => [84, v],
  shortCircuitDelay: (v) => [88, v],
};

const CONSTRAINTS = {
  blowDelay: [1, 200],
  blowDuration: [20, 400],
  fanLoad: [0, 100],
  stabilizationTemp: [20, 60],
  loadCurrent: [0, 100],
  loadVoltage: [2, 100],
  loadPower: [10, 1500],
  fanMinRPM: [0, 100],
  fanMaxVoltage: [3, 13],
  maxTemp: [-10, 100],
  minPressure: [-1, 4],
  minVoltage: isSmallBlock ? [-10, 20] : [-10, 40],
  shortCircuitDuration: [0, 200],
  shortCircuitDelay: [0, 100],
};

const STEPS = {
  blowDelay: 1,
  blowDuration: 10,
  fanLoad: 0.5,
  stabilizationTemp: 1,
  loadCurrent: 0.1,
  loadVoltage: 0.1,
  loadPower: 1,
  fanMinRPM: 0.5,
  fanMaxVoltage: 0.1,
  maxTemp: 1,
  minPressure: 0.05,
  minVoltage: 0.1,
  startCurrent: 0.1,
  currentStep: 0.1,
  endCurrent: 0.1,
  timeStep: 1,
  shortCircuitDelay: 1,
  shortCircuitDuration: 1,
};

const LOGGED_VALUES = [
  'load',
  'FCCurrent',
  'FCVoltage',
  'FCPower',
  'hydrogenPressure',
  'hydrogenConsumption',
  'temp1',
  'temp2',
  'temp3',
  'temp4',
  'temp5',
  'blowDuration',
  'blowDelay',
  'shortCircuitDuration',
  'shortCircuitDelay',
  'isBlow',
  'isShortCircuit',
];

const SERIAL_DATA = {
  FCPower: { label: 'FC power', units: 'W' },
};

for (let i = 0; i < PARAMS_DATA.length; ++i)
  SERIAL_DATA[PARAMS_DATA[i].name] = PARAMS_DATA[i];
for (let i = 0; i < STATE_DATA.length; ++i)
  SERIAL_DATA[STATE_DATA[i].name] = STATE_DATA[i];

PARAMS_DATA.forEach(addParamToMap);
STATE_DATA.forEach(addParamToMap);

function addParamToMap(param) {
  SERIAL_DATA[param.name] = param;
}

const SIGNALS = {
  tempError: 'Vysokaya temperatura, ostanovka\n',
  pressureError: 'Nizkoe davlenie, ostanovka\n',
  voltageError: 'Nizkoe napryazenie, ostanovka\n',
  stopPressed: 'Reset all prameters\n',
};

const STOP_BITS = [
  '',
  'Razgon zavershen, snyatie VAH\n',
  'Snyatie VAH zaversheno, holostoi hod\n',
  'Okonchanie avtorazgona\n\n\n\n',
];

const BOOST_MODES = ['Manual fan', 'Auto fan', 'Manual temp', 'Auto temp'];

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  COMMANDS,
  PARAMS_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
  CONFIG_PATH,
  CONSTRAINTS,
  STEPS,
  LOGGED_VALUES,
  SERIAL_DATA,
  TERMINATE_SIGNALS,
  SIGNALS,
  STOP_BITS,
  BOOST_MODES,
};
