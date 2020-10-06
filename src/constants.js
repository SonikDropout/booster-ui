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
  { label: 'Zaderjka produvki', units: 's', name: 'blowDelay', prefix: 'P ' },
  { label: 'Rejim', name: 'loadMode' },
  { label: 'Rejim razgona', name: 'boostMode' },
  {
    label: 'Dlitelnost KZ',
    units: 'ms',
    name: 'shortCircuitDuration',
    prefix: 'KZ ',
  },
  {
    label: 'Zadejka KZ',
    units: 's',
    name: 'shortCircuitDelay',
    prefix: 'KZ ',
  },
  { label: 'Produvka do KZ za', units: 's', name: 'blowBeforeShortCircuit' },
  { name: 'start' },
  { label: 'Bul li produv', name: 'isBlow' },
  { label: 'Bulo li KZ', name: 'isShortCircuit' },
  { name: 'tempError' },
  { name: 'pressureError' },
  { name: 'voltageError' },
  { name: 'stopBit' },
  { name: 'stopPressed' },
];

const TERMINATE_SIGNALS = STATE_DATA.slice(-5).map((v) => v.name);

const PARAMS_DATA = [
  {
    label: 'Dlitelnost produvki',
    units: 'ms',
    name: 'blowDuration',
    prefix: 'P ',
  },
  { label: 'Temperatura 1', units: 'C', name: 'temp1', divider: 10 },
  { label: 'Temperatura 2', units: 'C', name: 'temp2', divider: 10 },
  { label: 'Nomer experimenta', name: 'experimentNumber' },
  {
    label: 'Naprazhenie ventilatora',
    units: 'V',
    name: 'fanVoltage',
    divider: 1000,
  },
  {
    label: 'Zagruzka ventilatora',
    units: '%',
    name: 'fanLoad',
    divider: 10,
  },
  {
    label: 'Temperatura stabilizatsii',
    units: '\u00b0C',
    name: 'stabilizationTemp',
    divider: 10,
  },
  {
    label: 'Napryazenie',
    units: 'V',
    name: 'FCVoltage',
    divider: 100,
    signed: true,
  },
  { label: 'Tok', units: 'A', name: 'FCCurrent', divider: 1000, signed: true },
  {
    label: 'Davlenie H2',
    units: 'bar',
    name: 'hydrogenPressure',
    divider: 1000,
  },
  { label: 'Nagruzka', name: 'load', divider: 10 },
  {
    label: 'Teperatura\nradiatora',
    units: 'C',
    name: 'radiatorTemp',
    divider: 10,
  },
  { label: 'Min oboroty', units: 'ob/min', name: 'fanMinRPM' },
  {
    label: 'Max napryazenie',
    units: '',
    name: 'fanMaxVoltage',
    divider: 1000,
  },
  { label: 'Shag vremeni, s', units: 's', name: 'IVCStep' },
  {
    label: 'Otsechka po temperature',
    units: 'C',
    name: 'maxTemp',
    divider: 10,
  },
  {
    label: 'Otsechka po davleniy',
    units: 'bar',
    name: 'minPressure',
    divider: 1000,
    signed: true,
  },
  {
    label: 'Otsechka po naprazeniy',
    units: 'V',
    name: 'minVoltage',
    sined: true,
    divider: 10,
  },
  {
    label: 'Rashod H2',
    units: 'ml/min',
    name: 'hydrogenConsumption',
    sined: true,
  },
  {
    label: 'Nachalny tok',
    units: 'A',
    name: 'startCurrent',
    divider: 1000,
  },
  {
    label: 'Shag toka',
    units: 'A',
    name: 'currentStep',
    divider: 1000,
  },
  {
    label: 'Konechny tok',
    units: 'A',
    name: 'endCurrent',
    divider: 1000,
  },
  { label: 'Vremenoi shag', units: 's', name: 'timeStep' },
  { label: 'Do kontsa shaga', units: 's', name: 'stepRemain' },
];

const DATA_BYTE_LENGTH =
  STATE_DATA.length + PARAMS_DATA.length * 2 + SEPARATORS.length + 2;

const COMMANDS = {
  loadMode: (v) => [4, v],
  boostMode: (v) => [8, v],
  blowDelay: (v) => [12, v],
  blowDuration: (v) => [16, v],
  experimentNumber: (v) => [20, v],
  fanLoad: (v) => [24, (v * 10) | 0],
  stabilizationTemp: (v) => [28, v],
  load: (v) => [32, (v * 10) | 0],
  fanMinRPM: (v) => [36, (v * 10) | 0],
  fanMaxVoltage: (v) => [40, (v * 1000) | 0],
  IVCStep: (v) => [44, v],
  maxTemp: (v) => [48, v * 10],
  minPressure: (v) => [52, (v * 1000) | 0],
  minVoltage: (v) => [56, (v * 10) | 0],
  startCurrent: (v) => [60, (v * 1000) | 0],
  currentStep: (v) => [64, (v * 1000) | 0],
  endCurrent: (v) => [68, (v * 1000) | 0],
  timeStep: (v) => [72, v],
  stop: () => [76, 0],
  startCalibration: () => [80, 0],
  shortCircuitDuration: (v) => [84, v],
  shortCircuitDelay: (v) => [88, v],
};

const CONSTRAINTS = {
  blowDelay: [1, 200],
  blowDuration: [20, 400],
  experimentNumber: [0, 99999],
  fanLoad: [0, 100],
  stabilizationTemp: [20, 60],
  loadCurrent: isSmallBlock ? [0, 5] : [0, 20],
  loadVoltage: isSmallBlock ? [2, 20] : [2, 50],
  loadPower: isSmallBlock ? [0.1, 15] : [1, 150],
  fanMinRPM: [0, 100],
  fanMaxVoltage: [3, 13],
  IVCStep: [10, 990],
  maxTemp: [-10, 100],
  minPressure: [-1, 4],
  minVoltage: isSmallBlock ? [-10, 20] : [-10, 40],
  startCurrent: isSmallBlock ? [0.1, 5] : [0.1, 20],
  currentStep: isSmallBlock ? [0.1, 5] : [0.1, 20],
  endCurrent: isSmallBlock ? [0.1, 5] : [0.1, 20],
  timeStep: [10, 990],
  shortCircuitDuration: [0, 200],
  shortCircuitDelay: [0, 100],
};

const STEPS = {
  blowDelay: 1,
  blowDuration: 10,
  experimentNumber: 1,
  fanLoad: 0.5,
  stabilizationTemp: 1,
  loadCurrent: 0.1,
  loadVoltage: 0.1,
  loadPower: 1,
  fanMinRPM: 0.5,
  fanMaxVoltage: 0.1,
  IVCStep: 1,
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
  'fanVoltage',
  'blowDuration',
  'blowDelay',
  'shortCircuitDuration',
  'shortCircuitDelay',
  'isBlow',
  'isShortCircuit',
];

const SERIAL_DATA = {
  FCPower: { label: 'Moshnost TE', units: 'W' },
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
