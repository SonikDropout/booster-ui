<script>
  import RadioGroup from '../molecules/RadioGroup';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount, onDestroy } from 'svelte';
  import pointsStorage from '../utils/pointsStorage';
  import { serialData } from '../stores';
  import { dataGenerator } from '../utils/dataGenerator';

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(pointsStorage.points, {
        x: axesGroup.elements[selectedAxes].xLabel,
        y: axesGroup.elements[selectedAxes].yLabel,
      })
    );
    chart.options.onClick = chart.resetZoom;
  });

  onDestroy(() => chart && chart.destory());

  const axesGroup = {
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

  const dataEntries = ['FCVoltage', 'FCCurrent', 'FCPower'];

  let saveDisabled = true,
    chart,
    selectedAxes = 0,
    unsubscribeStopMonitor,
    isDrawing,
    unsubscribeStartMonitor = serialData.subscribe(monitorStart),
    timeStart;

  function changeAxes(e) {
    selectedAxes = +e.target.value;

    const axes = axesGroup.elements[selectedAxes];

    chart.options.scales.xAxes[0].scaleLabel.labelString = axes.xLabel;
    chart.options.scales.yAxes[0].scaleLabel.labelString = axes.yLabel;

    pointsStorage.setX(dataEntries.indexOf(axes.xKey) + 1);
    pointsStorage.setY(dataEntries.indexOf(axes.yKey) + 1);

    chart.data.datasets[0].data = pointsStorage.points;

    chart.update();
  }

  function stopDrawing() {
    unsubscribeStopMonitor();
    unsubscribeStartMonitor = serialData.subscribe(monitorStart);
  }

  function startDrawing() {
    unsubscribeStartMonitor();
    pointsStorage.drain();
    if (process.env.NODE_ENV == 'development') {
      for (let row of dataGenerator()) {
        pointsStorage.addRow(row);
      }
    }
    timeStart = Date.now();
    chart.data.datasets[0].data = pointsStorage.points;
    unsubscribeStopMonitor = serialData.subscribe(handleData);
  }
  
  function monitorStart(data) {
    if (data.start.value && chart) {
      startDrawing();
    }
  }

  function handleData(data) {
    if (!data.start.value && chart) {
      stopDrawing();
      return;
    }
    pointsStorage.addRow(
      [Math.round((Date.now() - timeStart) / 1000)].concat(
        dataEntries.map(key => data[key].value)
      )
    );
    chart.data.datasets[0].data = pointsStorage.points;
    chart.update();
  }
</script>

<main>
  <h2>Grafiki</h2>
  <RadioGroup
    style="grid-column: 1 / 3"
    type="horizontal"
    group={axesGroup}
    on:change={changeAxes}
    value={selectedAxes} />
  <Button
    style="grid-column: 3 / 4; justify-self: end"
    on:click={() => window.scrollTo(0, 0)}>
    Back
  </Button>
  <div class="chart">
    <canvas id="chart" />
  </div>
</main>

<style>
  main {
    display: grid;
    padding: 0 24px;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: 24px;
    height: 100vh;
    align-items: center;
  }
  h2 {
    grid-column: 1 / 4;
  }
  .chart {
    grid-column: 1 / 4;
    justify-self: stretch;
  }
</style>
