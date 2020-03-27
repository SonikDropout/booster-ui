<script>
  export let value;
  export let label;
  export let units;
</script>

<div class="wrap">
  <div class="label">
    {@html label},
    <em>{@html units}</em>
  </div>
  <div class="value">
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
  strong {
    font-weight: 500;
    font-size: 2rem;
  }
</style>
