<script>
  import wsClient from '../utils/wsClient';
  import Button from '../atoms/Button.svelte';
  import Spinner from '../atoms/Spinner.svelte';
  import Modal from '../molecules/Modal.svelte';
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
  function startUpdate() {
    wsClient.emit('update programm');
    isUpdating = true;
  }
  function closeModal() {
    showModal = false;
  }
</script>

{#if showModal}
  <Modal>
    <h2 class:error={updateError}>
      {#if !isUpdating}Доступно обновление!{:else if updateError}Не удалось
        обновить{:else}Обновление программы...{/if}
    </h2>
    {#if isUpdating}
      <Spinner size="lg" />
    {:else if !updateError}
      <p>Обновить сейчас?</p>
      <div class="buttons">
        <Button on:click={startUpdate}>Да</Button>
        <Button on:click={closeModal}>Нет</Button>
      </div>
    {/if}
  </Modal>
{/if}

<style>
  h2 {
    margin-bottom: auto;
  }
  h2.error {
    color: var(--danger-color);
  }
  .buttons {
    margin-top: 3rem;
  }
</style>
