<script>
  import Dashboard from './layouts/Dashboard.svelte';
  import Charts from './layouts/Charts.svelte';
  import Version from './atoms/Version.svelte';
  import BlockID from './atoms/BlockID.svelte';
  import { appInitialized } from './stores';
  import Settings from './layouts/Settings.svelte';
  import NavMenu from './organisms/NavMenu.svelte';
  import Notification from './organisms/Notification.svelte';
  import UpdateModal from './organisms/UpdateModal.svelte';
  import Scripts from './layouts/Scripting.svelte';

  appInitialized.subscribe((flag) => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

<Version />
{#if $appInitialized}
  <UpdateModal />
  <BlockID />
  <Dashboard />
  <Charts />
  <Settings />
  <NavMenu />
  <Notification />
  <Scripts />
{/if}
