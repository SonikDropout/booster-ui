<script>
  import Dashboard from './layouts/Dashboard.svelte';
  import Charts from './layouts/Charts.svelte';
  import Version from './atoms/Version.svelte';
  import BlockID from './atoms/BlockID.svelte';
  import { appInitialized } from './stores';
  import Settings from './layouts/Settings.svelte';
  import NavMenu from './organisms/NavMenu.svelte';
  import Scripting from './layouts/Scripting.svelte';
  import Notification from './organisms/Notification.svelte';

  appInitialized.subscribe((flag) => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

<Version />
{#if $appInitialized}
  <BlockID />
  <Dashboard />
  <Charts />
  <Settings />
  <NavMenu />
  <Scripting />
  <Notification />
{/if}
