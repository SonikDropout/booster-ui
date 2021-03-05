<script>
  import Button from '../atoms/Button.svelte';
  import RangeInput from '../molecules/RangeInput.svelte';
  import { __ } from '../utils/translator';
  import TextInput from '../molecules/TextInput.svelte';
  import { settings } from '../stores';
  import StartParamsSettings from '../organisms/StartParamsSettings.svelte';
  import CalibrationModal from '../organisms/CalibrationModal.svelte';

  let settingsCopy = $settings;

  function changeBlockId(id) {
    settingsCopy.id = id;
  }

  function setLogName(e) {
    settingsCopy.logName = e.target.value;
  }

  function updateSettings() {
    settings.set(settingsCopy);
    fetch('./config/initialize', { method: 'post', body: params });
    hideModal();
  }
  async function getStartParams() {
    const response = await fetch('./config/initialize');
    return await response.json();
  }

  let params;

  getStartParams().then((o) => {
    params = o;
  });
  function changeStartParam(value, name) {
    params[name] = value;
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
    <CalibrationModal />
  </div>
  <StartParamsSettings onChange={changeStartParam} {params} />
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
