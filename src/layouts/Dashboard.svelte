<script>
  import blocks from './blocks';
  import { COMMANDS, STEPS, CONSTRAINTS, SERIAL_DATA } from '../constants';
  import { serialData, getValue, experimentError } from '../stores';
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
    { message: 'Превышена температура!', name: 'tempError' },
    { message: 'Низкое давление!', name: 'pressureError' },
    { message: 'Низкое напряжение!', name: 'voltageError' },
  ];

  const loadModeOptions = [
    { value: 0, name: '', label: 'Нагрузка отключена' },
    {
      rangeLabel: 'Напряжение',
      value: 1,
      name: 'Voltage',
      label: 'Постоянное напряжение',
    },
    { rangeLabel: 'Ток', value: 2, name: 'Current', label: 'Постоянный ток' },
    {
      rangeLabel: 'Мощность',
      value: 3,
      name: 'Power',
      label: 'Постоянная мощность',
    },
  ];

  let selectedLoadMode = loadModeOptions[initialData.loadMode.value];

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
        <h3>Нагрузка</h3>
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
        {#if block.selects}
          {#each block.selects as { label, name, options }}
            <Select
              {options}
              {name}
              onChange={sendCommand}
              defaultValue={initialData[name].value}
              label={initialData[name].label} />
          {/each}
        {/if}
        {#if block.inputs}
          {#each block.inputs as name}
            <RangeInput
              errorMessage={name === 'experimentNumber' && $experimentError ? 'Обновите номер эксперимента' : ''}
              disabeld={$serialData.start.value && disabledOnStart.includes(name)}
              step={STEPS[name]}
              range={CONSTRAINTS[name]}
              suggestedValue={$serialData[name].value}
              label={initialData[name].label}
              {name}
              onChange={sendCommand}>
              {#if name == 'IVCStep'}
                <span class="hint">
                  до конца текущего {$serialData.stepRemain.value} с
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
        <Button size="sm" style="margin: 3rem auto 0;display:block" on:click={startCalibration}>
          Калибровка
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
    padding: 0 24px;
    height: 100%;
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
