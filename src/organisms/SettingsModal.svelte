<script>
  import Modal from '../molecules/Modal';
  import Button from '../atoms/Button.svelte';
  import RangeInput from '../molecules/RangeInput.svelte';
  import { __ } from '../utils/translator';
  import Icon from '../atoms/Icon.svelte';
  import TextInput from '../molecules/TextInput';
  import { ipcRenderer } from 'electron';
  import StartParamsSettings from './StartParamsSettings.svelte';

  let showModal = false,
    settings = ipcRenderer.sendSync('getSettings'),
    showStartParamsSettings = false;

  const hideModal = () => (showModal = false);

  function changeBlockId(id) {
    settings.id = id;
  }

  function setLogName(e) {
    settings.logName = e.target.value;
  }

  function updateSettings() {
    ipcRenderer.send('updateSettings', settings);
    hideModal();
  }
</script>

<div class="trigger">
  <Icon icon="settings" on:click={() => (showModal = true)} />
</div>

{#if showModal}
  <Modal onDismiss={hideModal}>
    <h3>{$__('settings')}</h3>
    {#if showStartParamsSettings}
      <StartParamsSettings discard={() => (showStartParamsSettings = false)} />
    {:else}
      <RangeInput
        label={$__('block id')}
        onChange={changeBlockId}
        suggestedValue={settings.id}
        name="blockId"
      />
      <TextInput
        label={$__('log name')}
        on:change={setLogName}
        defaultValue={settings.logName}
        name="logName"
      />
      <Button type="outline" on:click={() => (showStartParamsSettings = true)}
        >{$__('change start params')}</Button
      >
      <div class="controls">
        <Button on:click={updateSettings}>{$__('save')}</Button>
        <Button type="outline" on:click={hideModal}>{$__('cancel')}</Button>
      </div>
    {/if}
  </Modal>
{/if}

<style>
  h3 {
    margin-bottom: 1.2rem;
  }
  .trigger {
    position: fixed;
    top: 2rem;
    right: 2rem;
  }
  .controls {
    margin-top: 1.2rem;
    text-align: right;
  }
</style>
