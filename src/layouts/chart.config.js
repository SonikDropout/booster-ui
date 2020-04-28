module.exports = function config(points, axesLabels) {
  return {
    type: 'scatter',
    data: {
      datasets: [
        {
          data: points,
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
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            display: true,
            type: 'linear',
            scaleLabel: {
              display: true,
              labelString: axesLabels.x,
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
              labelString: axesLabels.y,
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
            mode: 'x',
          },
          zoom: {
            enabled: true,
            mode: 'x',
          },
        },
      },
    },
  };
};
