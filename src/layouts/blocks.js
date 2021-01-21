const { BOOST_MODES } = require('../constants');
module.exports = [
  [
    {
      title: 'Fuel cell',
      values: [
        { name: 'FCVoltage', minCompare: 'minVoltage' },
        { name: 'FCCurrent' },
        { name: 'FCPower' },
        { name: 'hydrogenPressure', minCompare: 'minPressure' },
        { name: 'hydrogenConsumption' },
      ],
    },
    {
      title: 'Valve',
      inputs: ['blowDelay', 'blowDuration'],
    },
    {
      title: 'Fan',
      inputs: ['fanMinRPM'],
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
  ],
  [
    {
      title: 'Temperatures',
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
