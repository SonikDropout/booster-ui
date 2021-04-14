<script>
  import { __ } from '../utils/translator';
  import Modal from './Modal.svelte';
  export let range = [0, 100];
  export let disabled = false;
  export let onChange = Function.prototype;
  export let name = '';
  export let style = '';
  export let step = 1;
  export let label = '';
  export let units = '';
  export let currentValue = range[0];
  export let errorMessage = '';

  $: min = Math.min.apply(null, range);
  $: max = Math.max.apply(null, range);
  $: precision = Math.max(0, -step.toExponential().split('e')[1]);

  let showInputModal;

  function handleChange(e) {
    let { name, value } = e.target;
    value = Math.max(min, Math.min(+value, max));
    onChange(value, name);
    showInputModal = false;
  }
  let userInput, triggerInput;
  $: if (userInput) userInput.focus();
  $: if (!showInputModal && triggerInput && userInput) triggerInput.focus();

  function handleTriggerInput(e) {
    if (/\d/.test(e.key) && !e.ctrlKey) showInputModal = true;
  }
</script>

{#if showInputModal}
  <Modal onDismiss={() => (showInputModal = false)} position="top" size="sm">
    <h4>{$__('setting')} {$__(label, true)}</h4>
    <label>
      <span class="label">{$__('current value:')}</span>
      <input type="number" {name} readonly value={currentValue} />
    </label>
    <label>
      <span class="label">{$__('set value:')}</span>
      <input
        type="number"
        {name}
        on:change={handleChange}
        {min}
        {max}
        {step}
        bind:this={userInput}
      />
    </label>
  </Modal>
{/if}
<label {style}>
  {#if label}
    <span class="label">
      {label + (units ? ', ' + units : '')}
      {#if errorMessage}
        <span class="error">{errorMessage}</span>
      {/if}
      <slot />
    </span>
  {/if}
  <input
    type="number"
    value={currentValue.toFixed(precision)}
    readonly
    {disabled}
    {name}
    bind:this={triggerInput}
    on:click={() => (showInputModal = true)}
    on:keydown={handleTriggerInput}
  />
</label>

<style>
  h4 {
    margin-bottom: 3.2rem;
  }
  label {
    display: flex;
    margin-bottom: 1.2rem;
    justify-content: space-between;
    align-items: center;
    line-height: 1;
  }
  .label {
    margin-bottom: 0.8rem;
  }
  input {
    width: 8rem;
  }
  .error {
    color: var(--danger-color);
    font-size: 0.8rem;
    display: block;
    animation: blink 0.7s ease infinite alternate;
  }
</style>
