<script>
  export let icon;
  export let name;
  export let interactive;
</script>

<i class="fas fa-{icon}" class:interactive {name} on:click />

<style>
  .interactive {
    cursor: pointer;
    font-size: 2rem;
  }
  .interactive:hover {
    color: var(--corporate-grey-darken);
  }
</style>
