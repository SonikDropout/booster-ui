<script>
  import { ALGORITHM_PARAM, ALGORITHM_DIRECTIONS, CONSTRAINTS, STEPS } from '../../common/constants';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import { __ } from '../utils/translator';
  import { algorithm } from '../stores';
  import SelectCell from '../molecules/SelectCell.svelte';
  import InputCell from '../molecules/InputCell.svelte';
  import ScriptExecutionControls from '../organisms/ScriptExecutionControls.svelte';
  let algorithmChanged;

  let algorithmCopy = $algorithm;
  const initialAlgorithm = JSON.stringify(algorithmCopy);

  $: isValidAlgorithm = isValid(algorithmCopy);
  $: algorithmChanged = JSON.stringify(algorithmCopy) !== initialAlgorithm;

  function isValid(script) {
    if (algorithmCopy.length < 1) return false;
    let valid = true;
    for (let step of script) {
      if (step.direction === 'hold') {
        if (!areAllDefined(step, ['param', 'min', 'stepTime'])) valid = false;
      } else if (
        !areAllDefined(step, [
          'param',
          'min',
          'max',
          'loop',
          'step',
          'stepTime',
        ])
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
    algorithmCopy = algorithmCopy.concat({});
  }
  function saveChanges() {
    algorithm.set(algorithmCopy);
  }
  function reassignAlgorithm() {
    algorithmCopy = algorithmCopy;
  }
  let isEditorBlocked;
  function blockEditor(doBlock) {
    isEditorBlocked = doBlock;
  }
  const deleteStep = (stepToDelete) =>
    function desctructor() {
      algorithmCopy = algorithmCopy.filter((_, i) => i !== stepToDelete);
    };

  $: saveDisabled = !isValidAlgorithm || !algorithmChanged || isEditorBlocked;
</script>

<div class="layout" id="script">
  <div class="table-wrapper">
    {#if isEditorBlocked}
      <div class="editor-blocker" />
    {/if}
    <table>
      <thead>
        <th>{$__('param')}</th>
        <th>{$__('direction')}</th>
        <th>{$__('min')}</th>
        <th>{$__('max')}</th>
        <th>{$__('loops')}</th>
        <th>{$__('step')}</th>
        <th>{$__('time step')}</th>
        <th class="row-controls" />
      </thead>
      {#each algorithmCopy as step, i}
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
              range={CONSTRAINTS[step.param]}
              step={STEPS[step.param]}
          />
          {#if step.direction === 'hold'}
            <td class="spacer" />
            <td class="spacer" />
            <td class="spacer" />
          {:else}
            <InputCell
              on:change={reassignAlgorithm}
              type="number"
              bind:value={step.max}
              name="max"
              range={CONSTRAINTS[step.param]}
              step={STEPS[step.param]}
            />
            <InputCell
              on:change={reassignAlgorithm}
              type="number"
              bind:value={step.loop}
              name="loop"
            />
            <InputCell
              on:change={reassignAlgorithm}
              type="number"
              bind:value={step.step}
              name="step"
              range={CONSTRAINTS[step.param]}
              step={STEPS[step.param]}
            />
          {/if}
          <InputCell
            on:change={reassignAlgorithm}
            type="number"
            bind:value={step.stepTime}
            name="stepTime"
          />
          <td>
            <Icon interactive icon="trash" on:click={deleteStep(i)} />
          </td>
        </tr>
      {/each}
    </table>
  </div>
  <div class="controls">
    <div class="execute-controls">
      <ScriptExecutionControls
        onExecute={blockEditor}
        disabled={!isValidAlgorithm}
        algorithm={algorithmCopy}
      />
    </div>
    <div class="script-controls">
      <Button on:click={addStep} disabled={isEditorBlocked}>{$__('add')}</Button
      >
      <Button on:click={saveChanges} disabled={saveDisabled}
        >{$__('save')}</Button
      >
    </div>
  </div>
</div>

<style>
  .row-controls {
    width: 3rem;
  }
  .controls {
    text-align: right;
    margin-top: auto;
    display: flex;
    justify-content: space-between;
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
  .table-wrapper {
    position: relative;
  }
  .editor-blocker {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.5);
  }
</style>
