<script>
  import wsClient from '../utils/wsClient';
  import Button from '../atoms/Button.svelte';
  import Spinner from '../atoms/Spinner.svelte';
  import Modal from '../molecules/Modal.svelte';
  import { __ } from '../utils/translator';
  let showModal = false,
    isUpdating,
    windowMessage = 'new version is available!',
    updateError;

  wsClient.emit('check update');
  wsClient.on('update available', () => (showModal = true));
  wsClient.on('update failed', (err) => {
    updateError = true;
    windowMessage = 'failed to update the programm';
    console.error(err);
    isUpdating = false;
  });
  wsClient.on('update done', () => (window.location.reload()));

  function startUpdate() {
    wsClient.emit('update programm');
    isUpdating = true;
    windowMessage = 'installing update, it may take a long time'
  }
  function closeModal() {
    showModal = false;
  }
</script>

{#if showModal}
  <Modal onDismiss={closeModal} locked={isUpdating}>
    <h2 class:error={updateError}>
        {$__(windowMessage)}
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
