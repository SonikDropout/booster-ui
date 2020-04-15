const { BOOST_MODES } = require('../constants');
module.exports = [
  [
    {
      title: 'БТЭ',
      inputs: ['experimentNumber'],
      values: [
        { name: 'FCVoltage', minCompare: 'minVoltage' },
        { name: 'FCCurrent' },
        { name: 'FCPower' },
        { name: 'hydrogenPressure', minCompare: 'minPressure' },
        { name: 'hydrogenConsumption' },
      ],
    },
    {
      title: 'Температуры',
      values: [
        { name: 'temp1', maxCompare: 'maxTemp' },
        { name: 'temp2', maxCompare: 'maxTemp' },
        { name: 'radiatorTemp' },
      ],
    },
  ],
  [
    {
      selects: [
        {
          name: 'boostMode',
          options: BOOST_MODES.map((label, value) => ({ value, label })),
        },
      ],
      inputs: [
        'maxTemp',
        'minPressure',
        'minVoltage',
        'IVCStep',
        'startCurrent',
        'currentStep',
        'endCurrent',
        'shortCircuitDuration',
        'shortCircuitDelay',
      ],
    },
  ],
  [
    {
      title: 'Клапан',
      inputs: ['blowDelay', 'blowDuration'],
    },
    {
      title: 'Вентилятор',
      inputs: ['fanLoad', 'fanMinRPM', 'fanMaxVoltage'],
      values: [{ name: 'fanVoltage' }],
    },
  ],
];
