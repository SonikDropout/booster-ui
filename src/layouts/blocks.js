module.exports = [
  [
    {
      title: 'БТЭ',
      inputs: ['experimentNumber'],
      values: [
        { name: 'FCVoltage' },
        { name: 'FCCurrent', errorIndicator: 'voltageError' },
        { name: 'hydrogenPressure', errorIndicator: 'pressureError' },
        { name: 'hydrogenConsumption' },
      ],
    },
    {
      title: 'Температуры',
      values: [
        { name: 'temp1', errorIndicator: 'tempError' },
        { name: 'temp2', errorIndicator: 'tempError' },
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
        'maxPressure',
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
