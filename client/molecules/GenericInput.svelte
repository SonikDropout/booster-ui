<script>
  import { uuid } from '../../common/helpers';
  export let name = '';
  export let type = '';
  export let label = '';
  export let step = 1;
  export let range = [0, 100];
  export let value = '';
  export let onChange = Function.prototype;
  const id = uuid();
  $: min = range[0];
  $: max = range[1];
  $: if (!range) range = [0, 100];
  function normalizeValue() {
    value = Math.max(min, Math.min(value, max));
    onChange(value, name);
  }
</script>

<label for={id}>
  {#if label}
    <span class="label">{label}</span>
  {/if}
  {#if type === 'number'}
    <input
      {id}
      type="number"
      bind:value
      on:blur={normalizeValue}
      class:short={!!label}
      {name}
      {step}
      {min}
      {max}
    />
  {:else}
    <input
      {id}
      bind:value
      on:change={() => onChange(value, name)}
      {name}
      class:labeled={!!label}
    />
  {/if}
</label>

<style>
  label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  input {
    width: 100%;
    box-shadow: none;
    height: 3.2rem;
    font-size: 2rem;
    line-height: 3.2rem;
    padding-left: 1.2rem;
  }
  input.short {
    max-width: 8rem;
  }
  input.labeled {
    max-width: 20rem;
  }
</style>
