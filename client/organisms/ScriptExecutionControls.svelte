<script>
  import Button from '../atoms/Button.svelte';
  import wsClient from '../utils/wsClient';
  import { __ } from '../utils/translator';
  import Exclamation from '../atoms/Exclamation.svelte';
  export let onExecute;
  export let disabled;
  export let algorithm;

  let isPaused, isExecuting, isRejected;

  $: onExecute(isExecuting);

  wsClient.onmessage((msg) => {
    if (typeof msg.data === 'string') {
      switch (msg.data) {
        case 'executionRejected':
          isPaused = true;
          isRejected = true;
        case 'executed':
          isExecuting = false;
      }
    }
  });

  function toggleExecution() {
    if (!isExecuting) {
      isExecuting = true;
      isRejected = false;
      wsClient.send('execute' + JSON.stringify(algorithm));
    } else {
      wsClient.send(isPaused ? 'resumeExecution' : 'pauseExecution');
      isPaused = !isPaused;
      isRejected = false;
    }
  }

  function stopExecution() {
    wsClient.send('stopExecution');
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
