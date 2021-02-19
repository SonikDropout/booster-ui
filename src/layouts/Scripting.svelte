<script>
  import { ipcRenderer } from 'electron';
  import { ALGORITHM_PARAM, ALGORITHM_DIRECTIONS } from '../constants';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import { __ } from '../utils/translator';
  import SelectCell from '../molecules/SelectCell.svelte';
  import InputCell from '../molecules/InputCell.svelte';

  let algorithm = [
    {
      param: 'voltage',
      min: 1,
      max: 10,
      step: 0.1,
      timeStep: 5,
      loops: 1,
      direction: 'up',
    },
    {
      param: 'current',
      direction: 'hold',
      min: 1,
      timeStep: 60,
    },
  ];

  $: isValidAlgorithm = isValid(algorithm);

  function isValid(script) {
    if (algorithm.length < 1) return false;
    let valid = true;
    for (let step of script) {
      if (step.direction === 'hold') {
        if (!areAllDefined(step, ['param', 'min', 'timeStep'])) valid = false;
      } else if (
        !areAllDefined(step, ['param', 'min', 'max', 'loops', 'timeStep'])
      )
        valid = false;
    }
    return valid;
  }

  function areAllDefined(obj, keys) {
    for (let key of keys) {
      if (obj[key] === undefined) return false;
    }
    return true;
  }

  function addStep() {
    algorithm = algorithm.concat({});
  }
  function saveChanges() {
    editedScript = null;
  }
  function startSelectedAlgoritm() {
    ipcRenderer.send('startExecution');
  }
  const validateAlgorithm = () => (isValidAlgorithm = isValid(algorithm));
  const deleteStep = (stepToDelete) => () =>
    (algorithm = algorithm.filter((_, i) => i !== stepToDelete));
</script>

<div class="layout" id="script">
  <div class="main">
    <table>
      <thead>
        <th>{$__('param')}</th>
        <th>{$__('direction')}</th>
        <th>{$__('min')}</th>
        <th>{$__('max')}</th>
        <th>{$__('loops')}</th>
        <th>{$__('time step')}</th>
        <th class="row-controls" />
      </thead>
      {#each algorithm as step, i}
        <tr>
          <SelectCell
            on:change={validateAlgorithm}
            bind:value={step.param}
            options={ALGORITHM_PARAM}
          />
          <SelectCell
            on:change={validateAlgorithm}
            options={ALGORITHM_DIRECTIONS}
            bind:value={step.direction}
          />
          <InputCell
            on:change={validateAlgorithm}
            type="number"
            bind:value={step.min}
            name="min"
          />
          {#if step.direction === 'hold'}
            <td class="spacer" />
            <td class="spacer" />
          {:else}
            <InputCell
              on:change={validateAlgorithm}
              type="number"
              bind:value={step.max}
              name="max"
            />
            <InputCell
              on:change={validateAlgorithm}
              type="number"
              bind:value={step.loops}
              name="loops"
            />
          {/if}
          <InputCell
            on:change={validateAlgorithm}
            type="number"
            bind:value={step.timeStep}
            name="timeStep"
          />
          <td>
            <Icon icon="cross" on:click={deleteStep(i)} />
          </td>
        </tr>
      {/each}
    </table>
    <div class="controls">
      <Button on:click={addStep}>{$__('add')}</Button>
      <Button on:click={saveChanges}>{$__('save')}</Button>
      <Button on:click={startSelectedAlgoritm} disabled={!isValidAlgorithm}
        >{$__('start')}</Button
      >
    </div>
  </div>
  <div class="footer">
    <Button on:click={() => window.scrollTo(0, 0)}>{$__('back')}</Button>
  </div>
</div>

<style>
  .row-controls {
    width: 3rem;
  }
  .controls {
    text-align: right;
  }
  .main {
    padding: 5rem 2.4rem;
  }
  .footer {
    margin-top: auto;
  }
  table {
    width: 100%;
    table-layout: fixed;
  }
</style>
