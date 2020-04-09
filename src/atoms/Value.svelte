<script>
  export let value = 0;
  export let label = '';
  export let units = '';
  export let error;
</script>

<div class="wrap">
  <div class="label">
    {@html label},
    <em>{@html units}</em>
  </div>
  <div class="value" class:error>
    <strong>{value}</strong>
  </div>
</div>

<style>
  .wrap {
    display: flex;
    /* flex-wrap: wrap; */
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.6rem;
  }
  .value {
    min-width: 10rem;
  }
  .value.error {
    color: var(--danger-color);
  }
  strong {
    font-weight: 500;
    font-size: 2rem;
  }
</style>
