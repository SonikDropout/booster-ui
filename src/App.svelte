<script>
  import Dashboard from './layouts/Dashboard';
  import { appInitialized } from './stores';

  const unsub = appInitialized.subscribe(flag => {
    if (flag) {
      document.getElementById('loading').remove();
      unsub();
    }
  });
</script>

{#if $appInitialized}
  <Dashboard />
{/if}
