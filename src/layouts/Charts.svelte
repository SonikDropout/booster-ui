<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, { x: '', y: '' })
    );
    chart.options.onClick = chart.resetZoom;
  });

  ipcRenderer.send('usbStorageRequest');
  ipcRenderer.on('usbConnected', () => (saveDisabled = false));
  ipcRenderer.on('usbDisconnected', () => (saveDisabled = true));

  let 
    points = [],
    saveDisabled = true,
    isDrawing,
    unsubscribeData,
    chart,
    timeStart;

  $: startDisabled = !selectedSubject;

  function toggleDrawing() {
    if (isDrawing) {
      unsubscribeData();
      stopDrawing();
    } else {
      startLogging();
      subscribeData();
    }
    isDrawing = !isDrawing;
  }

  function startLogging() {
    const fileName = '';
    const headers = [];
    ipcRenderer.send('startFileWrite', fileName, headers);
  }

  function stopDrawing() {
    points = [];
  }

  function subscribeData() {
    timeStart = Date.now();
      unsubscribeData = commonData.subscirbe(d => {
        const row = {x: 0, y: 0};
        sendToLogger(Object.values(row));
        updateChart(row);
      });
  }

  function updateChart(p) {
    points.push(p);
    chart.data.datasets[0].data = points;
    chart.update();
  }

  function sendToLogger(row) {
    ipcRenderer.send('excelRow', row);
  }

  function saveFile() {
    ipcRenderer.send('saveFile');
  }
</script>

<div class="layout">
  <header>Построение графиков</header>
  <main>
    <div class="chart">
      <canvas id="chart" height="400" width="520" />
    </div>
  </main>
  <footer>
    <div class="save">
      <Button on:click={saveFile} disabled={saveDisabled}>
        Сохранить данные на USB-устройство
      </Button>
    </div>
  </footer>
</div>