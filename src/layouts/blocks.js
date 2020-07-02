const { BOOST_MODES } = require('../constants');
module.exports = [
  [
    {
      title: 'BTE',
      values: [
        { name: 'FCVoltage', minCompare: 'minVoltage' },
        { name: 'FCCurrent' },
        { name: 'FCPower' },
        { name: 'hydrogenPressure', minCompare: 'minPressure' },
        { name: 'hydrogenConsumption' },
      ],
    },
    {
      title: 'Temperatury',
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
      title: 'Klapan',
      inputs: ['blowDelay', 'blowDuration'],
    },
    {
      title: 'Ventilator',
      inputs: ['fanLoad', 'fanMinRPM', 'fanMaxVoltage'],
      values: [{ name: 'fanVoltage' }],
    },
  ],
];
