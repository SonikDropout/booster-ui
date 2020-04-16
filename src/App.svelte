<script>
  import Dashboard from './layouts/Dashboard';
  import { appInitialized } from './stores';


  appInitialized.subscribe(flag => {
    if (flag) {
      document.getElementById('loading').remove();
    }
  });
</script>

{#if $appInitialized}
  <Dashboard />
{/if}
