const { BOOST_MODES } = require('../../common/constants');
module.exports = [
  [
    {
      title: 'fuel cell',
      values: [
        { name: 'FCVoltage', minCompare: 'minVoltage' },
        { name: 'FCCurrent' },
        { name: 'FCPower' },
        { name: 'hydrogenPressure', minCompare: 'minPressure' },
        { name: 'hydrogenConsumption' },
      ],
    },
    {
      title: 'valve',
      inputs: ['blowDelay', 'blowDuration'],
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
        'shortCircuitDuration',
        'shortCircuitDelay',
      ],
    },
    {
      title: 'fan',
      inputs: ['fanMinRPM', 'fanLoad'],
    },
  ],
  [
    {
      title: 'temperatures',
      values: [
        { name: 'temp1', maxCompare: 'maxTemp' },
        { name: 'temp2', maxCompare: 'maxTemp' },
        { name: 'temp3', maxCompare: 'maxTemp' },
        { name: 'temp4', maxCompare: 'maxTemp' },
        { name: 'temp5', maxCompare: 'maxTemp' },
        { name: 'radiatorTemp1' },
        { name: 'radiatorTemp2' },
      ],
    },
  ],
];
