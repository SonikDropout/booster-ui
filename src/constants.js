const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = {
  name: IS_RPI ? '/dev/ttyS0' : 'COM5',
  baudRate: 230400,
};

const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(7589);
SEPARATORS.writeUInt16BE(3333, 2);

const STATE_DATA = [
  { label: 'Задерка продувки', units: 'с', name: 'blowDelay' },
  { label: 'Режим', name: 'loadMode' },
  { label: 'Режим', name: 'boostMode' },
  { label: 'Длительность КЗ', units: 'мс', name: 'shortCircuitDuration' },
  { label: 'Задержка КЗ', units: 'с', name: 'shortCircuitDelay' },
  { label: 'Продука до КЗ за', units: 'с', name: 'blowBeforeShortCircuit' },
  { name: 'start' },
  { label: 'Был ли продув', name: 'isBlow' },
  { label: 'Было ли КЗ', name: 'isShortCircuit' },
  { name: 'tempError' },
  { name: 'pressureError' },
  { name: 'voltageError' },
  { name: 'stopBit' },
  { name: 'stopPressed' },
];

const TERMINATE_SIGNALS = STATE_DATA.slice(-5).map((v) => v.name);

const PARAMS_DATA = [
  {
    label: 'Длительность продувки',
    units: 'мс',
    name: 'blowDuration',
  },
  { label: 'Тепература 1', units: '\u00b0C', name: 'temp1', divider: 10 },
  { label: 'Тепература 2', units: '\u00b0C', name: 'temp2', divider: 10 },
  { label: 'Номер топливника', name: 'experimentNumber' },
  {
    label: 'Напряжение вентилятора',
    units: 'В',
    name: 'fanVoltage',
    divider: 1000,
  },
  {
    label: 'Загрузка вентилятора',
    units: '%',
    name: 'fanLoad',
    divider: 10,
  },
  {
    label: 'Температура стабилизации',
    units: '\u00b0C',
    name: 'stabilizationTemp',
    divider: 10,
  },
  {
    label: 'Напряжение',
    units: 'В',
    name: 'FCVoltage',
    divider: 1000,
    signed: true,
  },
  { label: 'Ток', units: 'А', name: 'FCCurrent', divider: 1000, signed: true },
  {
    label: 'Давление H<sub>2</sub>',
    units: 'бар',
    name: 'hydrogenPressure',
    divider: 1000,
  },
  { label: 'Нагрузка', name: 'load', divider: 10 },
  {
    label: 'Температура\nрадиатора',
    units: '\u00b0C',
    name: 'radiatorTemp',
    divider: 10,
  },
  { label: 'Min обороты', units: 'об/мин', name: 'fanMinRPM' },
  {
    label: 'Max напряжение',
    units: '',
    name: 'fanMaxVoltage',
    divider: 1000,
  },
  { label: 'Шаг ВАХ', units: 'А', name: 'IVCStep' },
  {
    label: 'Отсечка по температуре',
    units: '\u00b0C',
    name: 'maxTemp',
    divider: 10,
  },
  {
    label: 'Отсечка по давлению',
    units: 'бар',
    name: 'minPressure',
    divider: 1000,
    signed: true,
  },
  {
    label: 'Отсечка по напряжению',
    units: 'В',
    name: 'minVoltage',
    sined: true,
    divider: 10,
  },
  {
    label: 'Раход H<sub>2</sub>',
    units: 'мл/мин',
    name: 'hydrogenConsumption',
    sined: true,
  },
  {
    label: 'Начальный ток',
    units: 'А',
    name: 'startCurrent',
    divider: 1000,
  },
  {
    label: 'Шаг тока',
    units: 'А',
    name: 'currentStep',
    divider: 1000,
  },
  {
    label: 'Конечный ток',
    units: 'А',
    name: 'endCurrent',
    divider: 1000,
  },
  { label: 'Временной шаг', units: 'с', name: 'timeStep' },
  { label: 'До конца шага', units: 'с', name: 'stepRemain' },
];

const DATA_BYTE_LENGTH =
  STATE_DATA.length + PARAMS_DATA.length * 2 + SEPARATORS.length;

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
  IVCStep: (v) => [44, (v * 1000) | 0],
  maxTemp: (v) => [48, v],
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
  loadCurrent: [0, 14],
  loadVoltage: [2, 50],
  loadPower: [1, 150],
  fanMinRPM: [0, 100],
  fanMaxVoltage: [3, 13],
  IVCStep: [0.1, 14],
  maxTemp: [-10, 100],
  minPressure: [-1, 4],
  minVoltage: [-10, 40],
  startCurrent: [0.1, 14],
  currentStep: [0.1, 14],
  endCurrent: [0.1, 14],
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
  IVCStep: 0.1,
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
  FCPower: { label: 'Мощность ТЭ', units: 'Вт' },
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
  tempError: 'Высокая температура, остановка',
  pressureError: 'Низкое давление, остановка',
  voltageError: 'Низкое напряжение, остановка',
  stopPressed: 'Сброс всех параметров',
};

const STOP_BITS = [
  '',
  'Разгон завершен, снятие ВАХ\n',
  'Снятие ВАХ завершено, холостой ход\n',
  'Окончание авторазгона\n\n\n\n',
];

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  COMMANDS,
  PARAMS_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
  CONSTRAINTS,
  STEPS,
  LOGGED_VALUES,
  SERIAL_DATA,
  TERMINATE_SIGNALS,
  SIGNALS,
  STOP_BITS,
};
