exports.axesGroup = {
  name: 'axes',
  elements: [
    {
      value: 0,
      label: 'U(t)',
      yLabel: 'U, V',
      yKey: 'FCVoltage',
      xLabel: 't, c',
      xKey: 'time',
    },
    {
      value: 1,
      label: 'I(t)',
      yLabel: 'I, A',
      yKey: 'FCCurrent',
      xLabel: 't, c',
      xKey: 'time',
    },
    {
      value: 2,
      label: 'P(t)',
      yLabel: 'P, W',
      yKey: 'FCPower',
      xLabel: 't, c',
      xKey: 'time',
    },
    {
      value: 3,
      label: 'U(I)',
      yLabel: 'U, V',
      yKey: 'FCVoltage',
      xLabel: 'I, A',
      xKey: 'FCCurrent',
    },
    {
      value: 4,
      label: 'P(I)',
      yLabel: 'P, W',
      yKey: 'FCPower',
      xLabel: 'I, A',
      xKey: 'FCCurrent',
    },
  ],
};

exports.config = {
  type: 'line',
  data: {
    datasets: [
      {
        backgroundColor: 'rgba(26,162,221, .1)',
        borderColor: '#1aa2dd',
      },
    ],
  },
  options: {
    elements: {
      point: {
        radius: 5,
        borderWidth: 3,
        pointStyle: 'cross',
      },
    },
    legend: {
      display: false,
    },
    showLines: false,
    scales: {
      xAxes: [
        {
          display: true,
          type: 'linear',
          scaleLabel: {
            display: true,
          },
          ticks: {
            maxTickLimit: 8,
          },
        },
      ],
      yAxes: [
        {
          display: true,
          type: 'linear',
          scaleLabel: {
            display: true,
          },
          ticks: {
            maxTickLimit: 8,
          },
        },
      ],
    },
    animation: {
      duration: 0, // general animation time
    },
    hover: {
      animationDuration: 0, // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0, // animation duration after a resize
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
        },
        zoom: {
          enabled: true,
          mode: 'xy',
        },
      },
    },
  },
};
