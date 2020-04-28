<script>
  import blocks from './blocks';
  import { COMMANDS, STEPS, CONSTRAINTS, SERIAL_DATA } from '../constants';
  import { serialData, getValue } from '../stores';
  import Select from '../molecules/Select';
  import Value from '../atoms/Value';
  import RangeInput from '../molecules/RangeInput';
  import Warning from '../atoms/Warning';
  import Button from '../atoms/Button';
  import BlockIdSetter from '../organisms/BlockIdSetter';
  import { ipcRenderer } from 'electron';

  const initialData = getValue(serialData);

  const disabledOnStart = [
    'boostMode',
    'experimentNumber',
    'maxTemp',
    'minPressure',
    'minVoltage',
    'startCurrent',
    'currentStep',
    'endCurrent',
    'timeStep',
  ];

  const warnings = [
    { message: 'Prevushena temperatura!', name: 'tempError' },
    { message: 'Nizkoe davlenie!', name: 'pressureError' },
    { message: 'Nizkoe napryazhenie!', name: 'voltageError' },
  ];

  const loadModeOptions = [
    { value: 0, name: '', label: 'Nagruzka otklychena' },
    {
      rangeLabel: 'Napryazhenie',
      value: 1,
      name: 'Voltage',
      label: 'Postoyannoe napryazhenie',
    },
    { rangeLabel: 'Tok', value: 2, name: 'Current', label: 'Postoyanny tok' },
    {
      rangeLabel: 'Moshnost',
      value: 3,
      name: 'Power',
      label: 'Postoyannaya moshnost',
    },
  ];

  let selectedLoadMode = loadModeOptions[initialData.loadMode.value],
    experimentNumber = 0,
    experimentError,
    lastExperimentNumber;

  $: if (
    !$serialData.start.value &&
    $serialData.boostMode.value % 2 &&
    experimentNumber === lastExperimentNumber
  ) {
    experimentError = 'Obnovite nomer experimenta';
  }

  $: if ($serialData.start.value) lastExperimentNumber = experimentNumber;

  function changeExperimentNumber(num) {
    // lastExperimentNumber = experimentNumber;
    experimentNumber = num;
    if (experimentNumber !== lastExperimentNumber) experimentError = '';
    ipcRenderer.send('newExperimentNumber', experimentNumber);
  }

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
</script>

<BlockIdSetter />
<main>
  {#each blocks as column, idx}
    <div class="col-{idx}">
      {#if idx === 2}
        <h3>Nagruzka</h3>
        <Select
          onChange={selectLoadMode}
          name="loadMode"
          defaultValue={initialData.loadMode.value}
          label={initialData.loadMode.label}
          options={loadModeOptions} />
        {#if selectedLoadMode.value}
          <RangeInput
            name="load"
            suggestedValue={$serialData.load.value}
            step={STEPS['load' + selectedLoadMode.name]}
            label={selectedLoadMode.rangeLabel}
            range={CONSTRAINTS['load' + selectedLoadMode.name]}
            onChange={sendCommand} />
        {:else}
          <div class="input-placeholder" />
        {/if}
      {/if}
      {#each column as block}
        <h3>{block.title || ''}</h3>
        {#if block.title == 'BTE'}
          <RangeInput
            errorMessage={experimentError}
            disabled={$serialData.start.value}
            range={CONSTRAINTS.experimentNumber}
            suggestedValue={experimentNumber}
            label="Nomer experimenta"
            onChange={changeExperimentNumber} />
        {/if}
        {#if block.selects}
          {#each block.selects as { name, options }}
            <Select
              {options}
              {name}
              onChange={sendCommand}
              disabled={!!$serialData.start.value}
              defaultValue={initialData[name].value}
              label={initialData[name].label} />
          {/each}
        {/if}
        {#if block.inputs}
          {#each block.inputs as name}
            <RangeInput
              disabeld={$serialData.start.value && disabledOnStart.includes(name)}
              step={STEPS[name]}
              range={CONSTRAINTS[name]}
              suggestedValue={$serialData[name].value}
              label={initialData[name].label}
              {name}
              onChange={sendCommand}>
              {#if name == 'IVCStep'}
                <span class="hint">
                  do kontsa tekushego {$serialData.stepRemain.value} s
                </span>
              {/if}
            </RangeInput>
          {/each}
        {/if}
        {#if block.values}
          {#each block.values as val}
            <Value
              error={val.maxCompare ? $serialData[val.maxCompare].value < $serialData[val.name].value : val.minCompare ? $serialData[val.minCompare].value > $serialData[val.name].value : false}
              units={initialData[val.name].units}
              value={$serialData[val.name].value}
              label={initialData[val.name].label} />
          {/each}
        {/if}
      {/each}
      {#if idx === 0}
        <Button
          size="sm"
          style="margin: 1rem auto 0"
          on:click={startCalibration}>
          Kalibrovka
        </Button>
        <Button
          size="sm"
          style="margin: 1rem auto 0"
          on:click={() => window.scrollTo(0, window.innerHeight)}>
          Grafiki
        </Button>
      {/if}
    </div>
  {/each}
</main>

<style>
  main {
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
</style>
