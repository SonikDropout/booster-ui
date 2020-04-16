<script>
  import Dashboard from './layouts/Dashboard';
  import { appInitialized } from './stores';
  import { ipcRenderer } from 'electron';

  ipcRenderer.on('serverListening', (e, host, port) => {
    alert(`Логи доступну по адресу ${host}:${port}`);
  });

  appInitialized.subscribe(flag => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

{#if $appInitialized}
  <Dashboard />
{/if}
