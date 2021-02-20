<script>
  import { ipcRenderer } from 'electron';
  import { ALGORITHM_PARAM, ALGORITHM_DIRECTIONS } from '../constants';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import { __ } from '../utils/translator';
  import SelectCell from '../molecules/SelectCell.svelte';
  import InputCell from '../molecules/InputCell.svelte';

  let isPaused, isExecuting, isRejected, algorithmChanged;

  ipcRenderer.on('executionRejected', () => {
    isPaused = true;
    isRejected = true;
  });

  function toggleExecution() {
    if (!isExecuting) {
      isExecuting = true;
      isRejected = false;
      ipcRenderer.send('execute');
    } else {
      ipcRenderer.send(isPaused ? 'resumeExecution' : 'pauseExecution');
      isPaused = !isPaused;
      isRejected = false;
    }
    ipcRenderer.once('executed', () => (isExecuting = false));
  }

  function stopExecution() {
    ipcRenderer.send('stopExecution');
    isExecuting = false;
    isRejected = false;
  }

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
  const initialAlgorithm = JSON.parse(JSON.stringify(algorithm));

  $: isValidAlgorithm = isValid(algorithm);
  $: algorithmChanged =
    JSON.stringify(algorithm) !== JSON.stringify(initialAlgorithm);

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
  function reassignAlgorithm() {
    algorithm = algorithm;
  }
  const deleteStep = (stepToDelete) =>
    function desctructor() {
      algorithm = algorithm.filter((_, i) => i !== stepToDelete);
    };
</script>

<div class="layout" id="script">
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
          on:change={reassignAlgorithm}
          bind:value={step.param}
          options={ALGORITHM_PARAM}
        />
        <SelectCell
          on:change={reassignAlgorithm}
          options={ALGORITHM_DIRECTIONS}
          bind:value={step.direction}
        />
        <InputCell
          on:change={reassignAlgorithm}
          type="number"
          bind:value={step.min}
          name="min"
        />
        {#if step.direction === 'hold'}
          <td class="spacer" />
          <td class="spacer" />
        {:else}
          <InputCell
            on:change={reassignAlgorithm}
            type="number"
            bind:value={step.max}
            name="max"
          />
          <InputCell
            on:change={reassignAlgorithm}
            type="number"
            bind:value={step.loops}
            name="loops"
          />
        {/if}
        <InputCell
          on:change={reassignAlgorithm}
          type="number"
          bind:value={step.timeStep}
          name="timeStep"
        />
        <td>
          <Icon interactive icon="trash-alt" on:click={deleteStep(i)} />
        </td>
      </tr>
    {/each}
  </table>
  <div class="controls">
    <Button on:click={addStep}>{$__('add')}</Button>
    <Button
      on:click={saveChanges}
      disabled={!isValidAlgorithm || !algorithmChanged}>{$__('save')}</Button
    >
    <Button on:click={startSelectedAlgoritm} disabled={!isValidAlgorithm}
      >{$__('start')}</Button
    >
  </div>
</div>

<style>
  .row-controls {
    width: 3rem;
  }
  .controls {
    text-align: right;
  }
  .layout {
    padding: 5rem 2.4rem 2.4rem;
    display: flex;
    flex-direction: column;
  }
  table {
    width: 100%;
    table-layout: fixed;
  }
  th {
    font: 1.8rem 'Oswald';
  }
</style>
