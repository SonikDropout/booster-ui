<script>
  import Input from '../molecules/GenericInput.svelte';
  export let params;
  import { CONSTRAINTS, SERIAL_DATA, STEPS } from '../../common/constants';
  import { __ } from '../utils/translator';
  import loadModeOptions from '../models/loadModeOptions';
  import Select from '../molecules/Select.svelte';
  import startParams from '../models/startParams';
  export let onChange;
</script>

<h4>{$__('start params')}</h4>
<div class="inputs">
  {#each startParams as param}
    {#if param === 'loadMode'}
      <div>
        <Select
          name={param}
          label={$__(SERIAL_DATA[param].label)}
          {onChange}
          options={loadModeOptions}
          defaultValue={params[param]}
        />
      </div>
    {:else}
      <Input
        type="number"
        label={$__(SERIAL_DATA[param].label) +
          ', ' +
          $__(SERIAL_DATA[param].units || 'value', true)}
        range={CONSTRAINTS[param] && CONSTRAINTS[param]}
        step={STEPS[param]}
        name={param}
        {onChange}
        value={params[param]}
      />
    {/if}
  {/each}
</div>

<style>
  .inputs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 0 1.2rem;
    align-items: end;
  }
  h4 {
    margin: 2.4rem 0 1.2rem;
    text-align: left;
  }
</style>
