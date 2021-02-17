<script>
  import RangeInput from '../molecules/RangeInput';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import { CONSTRAINTS, SERIAL_DATA } from '../constants';
  import { __ } from '../utils/translator';
  import loadModeOptions from '../models/loadModeOptions';
  import Select from '../molecules/Select.svelte';
  export let discard;

  async function getStartParams() {
    const params = ipcRenderer.sendSync('getStartParams');
    return params;
  }

  let paramsPromise = getStartParams(),
    params = {};

  paramsPromise.then((o) => {
    params = o;
    return o;
  });

  function setStartValue(value, name) {
    params[name] = +value;
  }

  function confirm() {
    ipcRenderer.send('updateStartParams', params);
    discard();
  }
</script>

<div class="inputs">
  {#await paramsPromise}
    ...Loading
  {:then params}
    {#each Object.keys(params) as param}
      {#if param === 'loadMode'}
        <Select
          name={param}
          label={$__(SERIAL_DATA[param].label)}
          onChange={setStartValue}
          options={loadModeOptions}
          defaultValue={params[param]}
        />
      {:else}
        <RangeInput
          label={$__(SERIAL_DATA[param].label)}
          range={CONSTRAINTS[param]}
          onChange={setStartValue}
          suggestedValue={params[param]}
        />
      {/if}
    {/each}
  {/await}
</div>
  <div class="controls">
    <Button on:click={confirm}>{$__('save')}</Button>
    <Button type="outline" on:click={discard}>{$__('cancel')}</Button>
  </div>

<style>
  .inputs {
    overflow-y: auto;
    max-height: calc(70vh - 14rem);
  }
  .controls {
    text-align: right;
    margin-top: 1.2rem;
  }
</style>
