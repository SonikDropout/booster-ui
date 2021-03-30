<script>
  import Button from '../atoms/Button.svelte';
  import RangeInput from '../molecules/RangeInput.svelte';
  import { __ } from '../utils/translator';
  import Input from '../molecules/GenericInput.svelte';
  import { settings, initialize, notification } from '../stores';
  import StartParamsSettings from '../organisms/StartParamsSettings.svelte';
  import wsClient from '../utils/wsClient';
  import { COMMANDS } from '../../common/constants';
  import FlowmeterCalibrator from '../organisms/FlowmeterCalibrator.svelte';

  const settingsCopy = $settings;
  const startParamsCopy = $initialize;

  function changeBlockId(e) {
    settingsCopy.id = +e.target.value || 0;
  }

  function setLogName(e) {
    settingsCopy.logName = e.target.value;
  }

  function updateSettings() {
    settings.set(settingsCopy);
    initialize.set(startParamsCopy);
  }
  function changeStartParam(value, name) {
    startParamsCopy[name] = +value;
  }
  function sendCalibrationSignal() {
    wsClient.emit('serial command', ...COMMANDS.startCalibration());
    wsClient.once('command sent', () =>
      notification.set({ message: 'calibration done!', timeout: 1000 })
    );
  }
</script>

<div class="layout" id="settings">
  <h2>{$__('settings')}</h2>
  <Input
    type="number"
    label={$__('block id')}
    on:change={changeBlockId}
    value={settingsCopy.id}
    name="blockId"
  />
  <Input
    label={$__('log name')}
    on:change={setLogName}
    value={settingsCopy.logName}
    name="logName"
  />
  <div class="calibration">
    <Button on:click={sendCalibrationSignal}>{$__('calibrate I, V, P')}</Button>
    <FlowmeterCalibrator />
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
