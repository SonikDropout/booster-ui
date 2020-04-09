module.exports = [
  [
    {
      title: 'БТЭ',
      inputs: ['experimentNumber'],
      values: [
        { name: 'FCVoltage', maxCompare: 'maxVoltage' },
        { name: 'FCCurrent' },
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
      title: 'Разгон',
      selects: [
        {
          name: 'boostMode',
          options: [
            { value: 0, label: 'Ручной вент' },
            { value: 1, label: 'Авто вент' },
            { value: 2, label: 'Ручной темп' },
            { value: 3, label: 'Авто темп' },
          ],
        },
      ],
      inputs: [
        'IVCStep',
        'maxTemp',
        'minPressure',
        'maxVoltage',
        'startCurrent',
        'currentStep',
        'endCurrent',
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
