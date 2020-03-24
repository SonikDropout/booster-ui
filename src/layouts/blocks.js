module.exports = [
  [
    {
      title: 'БТЭ',
      inputs: ['experimentNumber'],
      values: [
        'FCVoltage',
        'FCCurrent',
        'hydrogenPressure',
        'hydrogenConsumption',
      ],
    },
    {
      title: 'Температуры',
      values: ['temp1', 'temp2'],
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
    },
  ],
];
