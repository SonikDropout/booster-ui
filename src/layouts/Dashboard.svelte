<script>
  import blocks from './blocks';
  import { COMMANDS, STEPS, CONSTRAINTS, SERIAL_DATA } from '../constants';
  import { serialData, getValue } from '../stores';
  import Select from '../molecules/Select';
  import Value from '../atoms/Value';
  import RangeInput from '../molecules/RangeInput';
  import Exclamation from '../atoms/Exclamation';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import { __ } from '../utils/translator';
  import loadModeOptions from '../models/loadModeOptions';
  import CalibrationModal from '../organisms/CalibrationModal.svelte';

  const initialData = getValue(serialData);

  const disabledOnStart = [
    'boostMode',
    'maxTemp',
    'minPressure',
    'minVoltage',
    'startCurrent',
    'currentStep',
    'endCurrent',
    'timeStep',
  ];

  let selectedLoadMode = loadModeOptions[initialData.loadMode.value],
    isPaused,
    isExecuting,
    isRejected;

  ipcRenderer.on('executionRejected', () => {
    isPaused = true;
    isRejected = true;
  });

  function sendCommand(value, name) {
    ipcRenderer.send('serialCommand', ...COMMANDS[name](+value));
  }

  function selectLoadMode(mode) {
    selectedLoadMode = loadModeOptions[mode];
    ipcRenderer.send('serialCommand', ...COMMANDS.loadMode(+mode));
  }

  function startCalibration() {
    ipcRenderer.send('serialCommand', ...COMMANDS.startCalibration());
  }

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
</script>

<div class="layout" id="parameters">
  {#each blocks as column, idx}
    <div class="col-{idx}">
      {#if idx === 2}
        <h3>{$__('load')}</h3>
        <Select
          onChange={selectLoadMode}
          name="loadMode"
          defaultValue={initialData.loadMode.value}
          label={$__(initialData.loadMode.label)}
          options={loadModeOptions}
        />
        {#if selectedLoadMode.value}
          <RangeInput
            name="load"
            suggestedValue={$serialData.load.value}
            step={STEPS['load' + selectedLoadMode.name]}
            label={$__(selectedLoadMode.rangeLabel)}
            range={CONSTRAINTS['load' + selectedLoadMode.name]}
            onChange={sendCommand}
          />
        {:else}
          <div class="input-placeholder" />
        {/if}
      {/if}
      {#each column as block}
        <h3>
          {#if block.title}{$__(block.title)}{/if}
        </h3>
        {#if block.selects}
          {#each block.selects as { name, options }}
            <Select
              {options}
              {name}
              onChange={sendCommand}
              defaultValue={initialData[name].value}
              label={$__(initialData[name].label)}
            />
          {/each}
        {/if}
        {#if block.inputs}
          {#each block.inputs as name}
            <RangeInput
              disabeld={$serialData.start.value &&
                disabledOnStart.includes(name)}
              step={STEPS[name]}
              range={CONSTRAINTS[name]}
              suggestedValue={$serialData[name].value}
              label={$__(initialData[name].label)}
              {name}
              onChange={sendCommand}
            />
          {/each}
        {/if}
        {#if block.values}
          {#each block.values as val}
            <Value
              error={val.maxCompare
                ? $serialData[val.maxCompare].value <
                  $serialData[val.name].value
                : val.minCompare
                ? $serialData[val.minCompare].value >
                  $serialData[val.name].value
                : false}
              units={$__(initialData[val.name].units)}
              value={$serialData[val.name].value}
              label={$__(initialData[val.name].label)}
            />
          {/each}
        {/if}
      {/each}
      {#if idx === 0}
        <Button
          size="sm"
          style="margin: 1rem auto 0"
          on:click={() => window.scrollTo(0, window.innerHeight)}
        >
          {$__('charts')}
        </Button>
        <Button
          size="sm"
          style="margin: 1rem auto 0"
          on:click={toggleExecution}
        >
          {#if isExecuting && !isPaused}
            <span class="pause" />
          {:else}
            <span class="play" />
          {/if}
        </Button>
        {#if isExecuting}
          <Button
            size="sm"
            style="margin: 1rem auto 0"
            on:click={stopExecution}
          >
            <span class="stop" />
          </Button>
        {/if}
        {#if isRejected}
          <Exclamation size="lg" />
        {/if}
      {/if}
    </div>
  {/each}
  <div class="controls">
    <CalibrationModal />
    <Button on:click={() => window.scrollTo(0, window.innerHeight * 2)}
      >{$__('scripts')}</Button
    >
  </div>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: 24px;
    padding: 0 24px 2rem;
    height: 100vh;
  }

  .hint {
    display: block;
    font-size: 1rem;
  }
  h3 {
    margin-top: 2.4rem;
    margin-bottom: 1.2rem;
  }
  .col-0 {
    grid-column: 1 / 2;
  }
  .col-1 {
    grid-column: 2 / 3;
  }

  .col-0 :global(.calibrate) {
    width: 100%;
  }
  .col-2 {
    grid-column: 3 / 4;
  }
  .input-placeholder {
    height: 3.2rem;
    margin-bottom: 1.2rem;
  }
  .stop,
  .pause {
    display: inline-block;
    width: 1.4rem;
    height: 1.4rem;
  }
  .pause {
    border-left: 0.3rem solid white;
    border-right: 0.3rem solid white;
  }
  .stop {
    background-color: white;
  }
  .play {
    display: inline-block;
    border-left: 1.4rem solid white;
    border-top: 0.7rem solid transparent;
    border-bottom: 0.7rem solid transparent;
  }
</style>
