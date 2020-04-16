<script>
  import Dashboard from './layouts/Dashboard';
  import { appInitialized } from './stores';
  import { version } from '../package.json';
  const { ipcRenderer } = require('electron');

  document.getElementById('version').innerText = version;

  const { host, port } = ipcRenderer.sendSync('serverAddressRequest');
  if (host) {
    alert(`Логи доступну по адресу ${host}:${port}`);
    console.log(`Логи доступну по адресу ${host}:${port}`);
  }

  appInitialized.subscribe(flag => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

{#if $appInitialized}
  <Dashboard />
{/if}
