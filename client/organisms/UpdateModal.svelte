<script>
  import wsClient from '../utils/wsClient';
  import Button from '../atoms/Button.svelte';
  import Spinner from '../atoms/Spinner.svelte';
  import Modal from '../molecules/Modal.svelte';
  import { __ } from '../utils/translator';
  let showModal = false,
    isUpdating,
    updateError;

  wsClient.emit('check update');
  wsClient.on('update available', () => (showModal = true));
  wsClient.on('update failed', (err) => {
    updateError = true;
    console.error(err);
    isUpdating = false;
  });
  wsClient.on('update done', () => window.location.assign('/'));
  function startUpdate() {
    wsClient.emit('update programm');
    isUpdating = true;
  }
  function closeModal() {
    showModal = false;
  }
</script>

{#if showModal}
  <Modal onDismiss={closeModal} locked={isUpdating}>
    <h2 class:error={updateError}>
      {#if !isUpdating}{$__(
          'new version is available!'
        )}{:else if updateError}{$__(
          'failed to update the programm'
        )}{:else}{$__('installing update, it may take a long time')}{/if}
    </h2>
    {#if isUpdating}
      <div class="spinner">
        <Spinner size="lg" />
      </div>
    {:else if !updateError}
      <p>{$__('update now?')}</p>
      <div class="buttons">
        <Button on:click={startUpdate}>{$__('yes')}</Button>
        <Button on:click={closeModal}>{$__('no')}</Button>
      </div>
    {/if}
  </Modal>
{/if}

<style>
  h2.error {
    color: var(--danger-color);
  }
  .buttons {
    text-align: right;
    margin-top: auto;
  }
  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1.2rem;
  }
</style>
