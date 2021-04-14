<script>
  export let icon = '';
  export let name = '';
  export let interactive = false;
</script>

<i class="icon icon-{icon}" class:interactive {name} on:click />

<style>
  .interactive {
    cursor: pointer;
    font-size: 2rem;
  }
  .interactive:hover {
    color: var(--corporate-grey-darken);
  }
</style>
