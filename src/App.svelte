<script>
  import Dashboard from './layouts/Dashboard';
  import { appInitialized } from './stores';
  const { ipcRenderer } = require('electron');

  const { host, port } = ipcRenderer.sendSync('serverAddressRequest');
  alert(`Логи доступну по адресу ${host}:${port}`);
  console.log(`Логи доступну по адресу ${host}:${port}`);

  appInitialized.subscribe(flag => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

{#if $appInitialized}
  <Dashboard />
{/if}
