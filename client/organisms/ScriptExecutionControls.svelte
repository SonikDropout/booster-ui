<script>
  import Button from '../atoms/Button.svelte';
  import { ipcRenderer } from 'electron';
  import { __ } from '../utils/translator';
  import Exclamation from '../atoms/Exclamation.svelte';
  export let onExecute;
  export let disabled;
  export let algorithm;

  let isPaused, isExecuting, isRejected;

  $: onExecute(isExecuting);

  ipcRenderer.on('executionRejected', () => {
    isPaused = true;
    isRejected = true;
  });

  function toggleExecution() {
    if (!isExecuting) {
      isExecuting = true;
      isRejected = false;
      ipcRenderer.send('execute', algorithm);
    } else {
      ipcRenderer.send(isPaused ? 'resumeExecution' : 'pauseExecution');
      isPaused = !isPaused;
      isRejected = false;
    }
    ipcRenderer.once('executed', () => (isExecuting = false));
  }

  function stopExecution() {
    ipcRenderer.send('stopExecution');
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
