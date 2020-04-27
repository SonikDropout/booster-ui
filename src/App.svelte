<script>
  import Dashboard from './layouts/Dashboard';
  import Charts from './layouts/Charts';
  import { appInitialized } from './stores';
  import { version } from '../package.json';
  const { ipcRenderer } = require('electron');

  document.getElementById('version').innerText = version;

  const { host = 'n/a', port = 6009 } = ipcRenderer.sendSync('serverAddressRequest');

  appInitialized.subscribe(flag => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

<div>Logi dostupny po adresy {host}:{port}</div>
{#if $appInitialized}
  <Dashboard />
  <Charts />
{/if}

<style>
  div {
    position: fixed;
    top: 4px;
    left: 24px;
    font-size: 1.2rem;
    color: var(--corporate-grey-darken);
  }
</style>
