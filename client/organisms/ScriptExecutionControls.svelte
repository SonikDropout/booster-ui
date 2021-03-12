<script>
  import Button from '../atoms/Button.svelte';
  import wsClient from '../utils/wsClient';
  import { __ } from '../utils/translator';
  import Exclamation from '../atoms/Exclamation.svelte';
  import { notification } from '../stores';
  export let onExecute;
  export let disabled;
  export let algorithm;

  let isPaused, isExecuting, isRejected;

  $: onExecute(isExecuting);

  wsClient.on('executionRejected', () => {
    isPaused = true;
    isRejected = true;
    notification.set({
      type: 'error',
      message: 'automatic operation interrupted'
    })
  });
  wsClient.on('executed', () => {
    isExecuting = false;
  });

  function toggleExecution() {
    if (!isExecuting) {
      isExecuting = true;
      isRejected = false;
      wsClient.emit('execute', algorithm);
    } else {
      wsClient.emit(isPaused ? 'resumeExecution' : 'pauseExecution');
      isPaused = !isPaused;
      isRejected = false;
    }
  }

  function stopExecution() {
    wsClient.emit('stopExecution');
    isExecuting = false;
    isRejected = false;
    isPaused = false;
  }
</script>

<Button on:click={toggleExecution} {disabled}
  >{!isExecuting
    ? $__('start')
    : isPaused
    ? $__('resume')
    : $__('pause')}</Button
>
{#if isExecuting}
  <Button on:click={stopExecution}>{$__('stop')}</Button>
{/if}
{#if isRejected}
  <Exclamation />
{/if}
