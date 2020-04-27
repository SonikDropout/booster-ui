<script>
  import RadioGroup from '../molecules/RadioGroup';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount, onDestroy } from 'svelte';
  import pointsStorage from '../utils/pointsStorage';
  import { serialData } from '../stores';

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
        xLabel: 'U, V',
        xKey: 'FCVoltage',
        yLabel: 't, c',
        yKey: 'time',
      },
      {
        value: 1,
        label: 'I(t)',
        xLabel: 'I, A',
        xKey: 'FCCurrent',
        yLabel: 't, c',
        yKey: 'time',
      },
      {
        value: 2,
        label: 'P(t)',
        xLabel: 'P, W',
        xKey: 'FCPower',
        yLabel: 't, c',
        yKey: 'time',
      },
      {
        value: 3,
        label: 'U(I)',
        xLabel: 'U, V',
        xKey: 'FCVoltage',
        yLabel: 'I, A',
        yKey: 'FCCurrent',
      },
      {
        value: 4,
        label: 'P(I)',
        xLabel: 'P, W',
        xKey: 'FCPower',
        yLabel: 'I, A',
        yKey: 'FCCurrent',
      },
    ],
  };

  const dataEntries = ['FCVoltage', 'FCCurrent', 'FCPower'];

  let saveDisabled = true,
    unsubscribeData,
    selectedAxes = 0,
    chart,
    timeStart;

  $: if ($serialData.start.value && !pointsStorage.rows.length) startDrawing();
  $: if (!$serialData.start.value && pointsStorage.rows.length) stopDrawing();

  function changeAxes(e) {
    selectedAxes = +e.target.value;

    const axes = axesGroup.elements[selectedAxes];

    chart.options.scales.xAxes[0].scaleLabel.labelString = axes.xLabel;
    chart.options.scales.yAxes[0].scaleLabel.labelString = axes.yLabel;

    pointsStorage.setX(dataEntries.indexOf(axes.xKey));
    pointsStorage.setY(dataEntries.indexOf(axes.yKey));

    chart.update();
  }

  function stopDrawing() {
    unsubscribeData();
    pointsStorage.drain();
  }

  function startDrawing() {
    timeStart = Date.now();
    unsubscribeData = commonData.subscribe(d => {
      pointsStorage.addRow(
        [Math.round((Date.now() - timeStart) / 1000)].concat(
          dataEntries.map(key => d[key].value)
        )
      );
      chart.update();
    });
  }
</script>

<main>
  <h2>Графики</h2>
  <RadioGroup
    style="grid-column: 1 / 3"
    type="horizontal"
    group={axesGroup}
    on:change={changeAxes}
    value={selectedAxes} />
  <Button style="grid-column: 3 / 4" on:click={() => window.scrollTo(0, 0)}>
    Назад
  </Button>
  <div class="chart">
    <canvas id="chart" height="400" width="520" />
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  h2 {
    grid-column: 1 / 4;
  }
  .chart {
    grid-column: 1 / 4;
  }
</style>
