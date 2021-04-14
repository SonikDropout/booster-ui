<script>
  import Button from '../atoms/Button.svelte';

  export let name = '';
  export let type = '';
  export let step = 1;
  export let range = [0, 100];
  export let value = range[0];
  $: min = range[0];
  $: max = range[1];
  $: if (!range) range = [0, 100];
  function normalizeValue() {
    value = Math.max(min, Math.min(value, max));
  }
</script>

<td>
  {#if type === 'number'}
    <input
      type="number"
      bind:value
      on:blur={normalizeValue}
      {name}
      {step}
      {min}
      {max}
    />
  {:else if type === 'text'}
    <input type="text" bind:value {name} />
  {/if}
</td>

<style>
  input {
    width: 100%;
    box-shadow: none;
    height: 3.2rem;
    font-size: 2rem;
    line-height: 3.2rem;
    padding-left: 1.2rem;
  }
</style>
