<script>
  import blocks from './blocks';
  import { COMMANDS, STEPS, CONSTRAINTS, SERIAL_DATA } from '../constants';
  import { serialData, getValue, experimentError } from '../stores';
  import Select from '../molecules/Select';
  import Value from '../atoms/Value';
  import RangeInput from '../molecules/RangeInput';
  import Warning from '../atoms/Warning';
  import { ipcRenderer } from 'electron';

  const initialData = getValue(serialData);

  const disabledOnStart = [
    'boostMode',
    'experimentNumber',
    'maxTemp',
    'minPressure',
    'maxVoltage',
    'startCurrent',
    'currentStep',
    'endCurrent',
    'timeStep',
  ];

  const warnings = [
    { message: 'Превышена температура!', name: 'tempError' },
    { message: 'Низкое давление!', name: 'pressureError' },
    { message: 'Превышено напряжение!', name: 'voltageError' },
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
</script>

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
            defaultValue={initialData.load.value}
            step={STEPS['load' + selectedLoadMode.name]}
            label={selectedLoadMode.rangeLabel}
            onChange={sendCommand} />
        {:else}
          <div class="input-placeholder" />
        {/if}
      {/if}
      {#each column as block}
        <h3>{block.title}</h3>
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
              defaultValue={initialData[name].value}
              label={initialData[name].label}
              {name}
              onChange={sendCommand} />
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
        {#each warnings as { name, message }}
          {#if $serialData[name].value}
            <Warning {message} />
          {/if}
        {/each}
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
  .col-2 {
    grid-column: 3 / 4;
  }
  .input-placeholder {
    height: 3.2rem;
    margin-bottom: 1.2rem;
  }
</style>
