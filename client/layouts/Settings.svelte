<script>
  import Button from '../atoms/Button.svelte';
  import RangeInput from '../molecules/RangeInput.svelte';
  import { __ } from '../utils/translator';
  import TextInput from '../molecules/TextInput.svelte';
  import { settings, initialize } from '../stores';
  import StartParamsSettings from '../organisms/StartParamsSettings.svelte';
  import wsClient from '../utils/wsClient';
  import { COMMANDS } from '../../common/constants';

  const settingsCopy = $settings;
  const startParamsCopy = $initialize;

  function changeBlockId(id) {
    settingsCopy.id = id;
  }

  function setLogName(e) {
    settingsCopy.logName = e.target.value;
  }

  function updateSettings() {
    settings.set(settingsCopy);
    initialize.set(startParamsCopy);
  }
  function changeStartParam(value, name) {
    startParamsCopy[name] = value;
  }
  function sendCalibrationSignal() {
    wsClient.emit('serial command', ...COMMANDS.startCalibration);
  }
</script>

<div class="layout" id="settings">
  <h2>{$__('settings')}</h2>
  <RangeInput
    label={$__('block id')}
    onChange={changeBlockId}
    suggestedValue={settingsCopy.id}
    name="blockId"
  />
  <TextInput
    label={$__('log name')}
    on:change={setLogName}
    defaultValue={settingsCopy.logName}
    name="logName"
  />
  <div class="calibration">
    <Button on:click={sendCalibrationSignal}>{$__('calibration')}</Button>
  </div>
  <StartParamsSettings onChange={changeStartParam} params={startParamsCopy} />
  <div class="controls">
    <Button on:click={updateSettings}>{$__('save')}</Button>
  </div>
</div>

<style>
  .layout {
    padding: 2.4rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .controls {
    margin-top: auto;
    text-align: right;
  }
</style>
