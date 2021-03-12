<script>
  import { notification } from '../stores';
  import { onDestroy } from 'svelte';
  import CountdownBar from '../atoms/CountdownBar.svelte';
  import { fly } from 'svelte/transition';
  import Portal from '../atoms/Portal.svelte';
  import { __ } from '../utils/translator';

  let hideTimeout;

  $: if ($notification && $notification.timeout) {
    hideTimeout = setTimeout(removeSelf, $notification.timeout);
  }
  onDestroy(() => {
    clearTimeout(hideTimeout);
  });

  function removeSelf() {
    notification.set(null);
  }
</script>

{#if $notification}
  <Portal>
    <div class="notification {$notification.type}" transition:fly={{ y: -200 }}>
      <div class="cross" on:click={removeSelf}>x</div>
      <p>{$__($notification.message)}</p>
      {#if $notification.timeout}
        <CountdownBar
          timeout={$notification.timeout}
          type={notification.type}
        />
      {/if}
    </div>
  </Portal>
{/if}

<style>
  .notification {
    position: fixed;
    top: 2.4rem;
    right: 2.4rem;
    z-index: 9009;
    padding: 1.2rem 2.4rem;
    background-color: white;
    box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.5);
    border-radius: 0.4rem;
  }
  .notification.error {
    color: white;
    background-color: var(--danger-color);
  }
  p {
    margin: 0;
    line-height: 200%;
  }
  .cross {
    text-align: right;
    margin-top: -0.8rem;
    margin-right: -1rem;
  }
</style>
