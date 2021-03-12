<script>
  import { constraint } from '../../common/helpers';
  import Modal from './Modal.svelte';
  export let range = [0, 100];
  export let disabled;
  export let onChange;
  export let name;
  export let style;
  export let step = 1;
  export let label;
  export let currentValue = range[0];
  export let errorMessage = '';

  $: min = Math.min.apply(null, range);
  $: max = Math.max.apply(null, range);
  $: precision = Math.max(0, -step.toExponential().split('e')[1]);

  let showInputModal;
</script>

{#if showInputModal}
  <Modal onDismiss={() => (showInputModal = false)}>
    <input type="number" {name} readonly value={currentValue} />
    <input type="number" {name} on:change={onChange} {min} {max} {step} />
  </Modal>
{/if}
<label {style}>
  {#if label}
    <span class="label">
      {label}
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
    on:click={() => (showInputModal = true)}
  />
</label>

<style>
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
    border: none;
    font-size: 2rem;
    text-align: center;
    outline: none;
  }
  input:focus {
    outline: none;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  .error {
    color: var(--danger-color);
    font-size: 0.8rem;
    display: block;
    animation: blink 0.7s ease infinite alternate;
  }
</style>
