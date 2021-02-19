<script>
  import Dashboard from './layouts/Dashboard';
  import Charts from './layouts/Charts';
  import { appInitialized } from './stores';
  import { version } from '../package.json';
  import UpdateModal from './organisms/UpdateModal';
  import Settings from './layouts/Settings.svelte';
  import NavMenu from './organisms/NavMenu.svelte';
  import Scripting from './layouts/Scripting.svelte';
  const { ipcRenderer } = require('electron');
  let updateAvailable = ipcRenderer.sendSync('checkUpdate');

  ipcRenderer.on('updateAvailable', () => (updateAvailable = true));

  document.getElementById('version').innerText = version;

  const { host = 'n/a', port = 6009 } = ipcRenderer.sendSync(
    'serverAddressRequest'
  );

  appInitialized.subscribe((flag) => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

<div>Logi dostupny po adresy {host}:{port}</div>
{#if $appInitialized}
  <Dashboard />
  <Charts />
  <Settings />
  <NavMenu />
  <Scripting />
{/if}
{#if updateAvailable}
  <UpdateModal />
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
