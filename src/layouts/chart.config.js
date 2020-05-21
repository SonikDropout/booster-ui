module.exports = function config(points, axesLabels) {
  return {
    type: 'line',
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
      downsample: {
        enabled: true,
        threshold: 500, // change this

        auto: false, // don't re-downsample the data every move
        onInit: true,

        preferOriginalData: true, // use our original data when downscaling so we can downscale less, if we need to.
        restoreOriginalData: false, // if auto is false and this is true, original data will be restored on pan/zoom - that isn't what we want.
      },
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
};
