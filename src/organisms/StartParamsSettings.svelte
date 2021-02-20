<script>
  import RangeInput from '../molecules/RangeInput';
  export let params;
  import { CONSTRAINTS, SERIAL_DATA } from '../constants';
  import { __ } from '../utils/translator';
  import loadModeOptions from '../models/loadModeOptions';
  import Select from '../molecules/Select.svelte';
  export let onChange;
  $: console.log(params);
</script>

<h4>{$__('start params')}</h4>
<div class="inputs">
  {#if !params}
    ...Loading
  {:else}
    {#each Object.keys(params) as param}
      {#if param === 'loadMode'}
        <Select
          name={param}
          label={$__(SERIAL_DATA[param].label)}
          {onChange}
          options={loadModeOptions}
          defaultValue={params[param]}
        />
      {:else}
        <RangeInput
          label={$__(SERIAL_DATA[param].label)}
          range={CONSTRAINTS[param]}
          {onChange}
          suggestedValue={params[param]}
        />
      {/if}
    {/each}
  {/if}
</div>

<style>
  .inputs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 0 1.2rem;
  }
  h4 {
    margin: 2.4rem 0 1.2rem;
    text-align: left;
  }
</style>
