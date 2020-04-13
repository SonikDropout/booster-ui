<script>
  export let value = 0;
  export let label = '';
  export let units = '';
  export let error = true;
</script>

<div class="wrap" class:error>
  <div class="label">
    {@html label}
    ,
    <em>
      {@html units}
    </em>
  </div>
  <div class="value">
    <strong>{value}</strong>
  </div>
  {#if error}
    <div class="exclamation">!</div>
  {:else}
    <div class="spacer" />
  {/if}
</div>

<style>
  .wrap {
    display: flex;
    /* flex-wrap: wrap; */
    align-items: center;
    margin-bottom: 1.6rem;
  }
  .value {
    min-width: 10rem;
    margin-left: auto;
  }
  .error {
    color: var(--danger-color);
  }
  strong {
    font-weight: 500;
    font-size: 2rem;
  }
  .spacer,
  .exclamation {
    width: 2rem;
    min-width: 2rem;
    height: 2rem;
  }
  .exclamation {
    animation: blink 0.7s ease infinite alternate;
    text-align: center;
    border: 1px solid;
    border-radius: 50%;
  }
</style>
