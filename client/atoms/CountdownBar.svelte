<script>
  export let timeout = 1000;
  export let style;
  export let type = 'info';
  import { onDestroy } from 'svelte';
  let remains = 100;
  const interval = setInterval(() => --remains, timeout / 100);
  onDestroy(() => clearInterval(interval));
</script>

<div style="transform:scaleX({remains / 100});{style}" class={type} />

<style>
  div {
    height: 0.4rem;
    background-color: var(--corporate-blue);
    transform-origin: left center;
  }
  div.danger {
    background-color: var(--danger-color);
  }
  div.error {
    background-color: white;
  }
</style>
