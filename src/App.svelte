<script>
  import Dashboard from './layouts/Dashboard';
  import Charts from './layouts/Charts';
  import Version from './atoms/Version';
  import BlockID from './atoms/BlockID.svelte';
  import { appInitialized } from './stores';
  import UpdateModal from './organisms/UpdateModal';
  import Settings from './layouts/Settings.svelte';
  import NavMenu from './organisms/NavMenu.svelte';
  import Scripting from './layouts/Scripting.svelte';
  const { ipcRenderer } = require('electron');
  let updateAvailable = ipcRenderer.sendSync('checkUpdate');

  ipcRenderer.on('updateAvailable', () => (updateAvailable = true));

  appInitialized.subscribe((flag) => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

<Version />
<BlockID />
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