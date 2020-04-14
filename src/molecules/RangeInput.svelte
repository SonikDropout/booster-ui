<script>
  import { constraint } from '../utils/others';
  export let range = [0, 100];
  export let disabled;
  export let onChange;
  export let name;
  export let suggestedValue = range[0];
  export let style;
  export let step = 1;
  export let label;
  export let errorMessage;

  let min = Math.min.apply(null, range);
  let max = Math.max.apply(null, range);
  $: value = suggestedValue;

  // $: if (
  //   Math.abs(suggestedValue - value) > 0.01 &&
  //   min <= suggestedValue &&
  //   max >= suggestedValue
  // ) {
  //   clearTimeout(updateTimeout);
  //   updateTimeout = setTimeout(updateValue, 3000);
  // } else {
  //   clearTimeout(updateTimeout);
  // }

  function updateValue() {
    value = suggestedValue;
  }

  let timeout,
    interval,
    updateTimeout,
    precision = 0,
    startX,
    showControls = false;

  $: if (step < 1) precision = 1;
  $: if (step < 0.1) precision = 2;

  function increment() {
    if (value + step <= max) {
      value += step;
    } else {
      clearTimers();
    }
  }

  function decrement() {
    if (value - step >= min) {
      value -= step;
    } else {
      clearTimers();
    }
  }

  function stickyCall(fn) {
    fn();
    timeout = setTimeout(() => {
      fn();
      interval = setInterval(fn, 50);
    }, 500);
  }

  function pressIncrement(e) {
    stickyCall(increment);
    e.target.setPointerCapture(e.pointerId);
  }

  function pressDecrement(e) {
    stickyCall(decrement);
    e.target.setPointerCapture(e.pointerId);
  }

  function clearTimers() {
    clearInterval(interval);
    clearTimeout(timeout);
  }

  function release(e) {
    clearTimers();
    e.target.releasePointerCapture(e.pointerId);
    onChange(value, name);
  }

  function startMoveIncrement(e) {
    // e.preventDefault();
    startX = e.clientX;
    e.target.setPointerCapture(e.pointerId);
  }

  function incrementOnMove(e) {
    if (startX === void 0) return;
    e.preventDefault();
    const diff = startX - e.clientX;
    const inc = (diff / 100) * (max - min) * 0.5;
    value = constraint(value - inc, range);
    startX = e.clientX;
  }

  function releaseMoveIncrement(e) {
    e.preventDefault();
    startX = void 0;
    e.target.releasePointerCapture(e.pointerId);
    onChange(value, name);
  }

  function handleInputChange(e) {
    value = +e.target.value;
    onChange(value, name);
  }
</script>

<label {style}>
  {#if label}
    <span class="label">
      {label}
      <slot />
    </span>
  {/if}
  <span class="input-wrapper" class:disabled>
    <button
      disabled={value <= min || disabled}
      class="decrementer"
      on:pointerdown={pressDecrement}
      on:pointercancel={release}
      on:pointerup={release}>
      <span>-</span>
    </button>
    <input
      on:focus={e => e.target.select()}
      type="number"
      {min}
      {max}
      {step}
      {name}
      value={value.toFixed(precision)}
      on:change={handleInputChange} />
    <button
      disabled={value >= max || disabled}
      class="incrementer"
      on:pointerdown={pressIncrement}
      on:pointercancel={release}
      on:pointerup={release}>
      <span>+</span>
    </button>
  </span>
  {#if errorMessage}
    <span class="error">{errorMessage}</span>
  {/if}
</label>

<style>
  label {
    display: flex;
    margin-bottom: 1.2rem;
    justify-content: space-between;
    align-items: center;
  }
  .label {
    margin-bottom: 0.8rem;
  }
  .input-wrapper {
    max-width: 16rem;
    min-width: 16rem;
    height: 3.2rem;
    line-height: 3.2rem;
  }
  .input-wrapper.disabled {
    opacity: 0.6;
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
  button {
    border-radius: 50%;
    padding: 0;
    border: 1px solid var(--text-color);
    background-color: transparent;
    width: 3.2rem;
    font-size: 2.4rem;
    line-height: 3rem;
    font-weight: 300;
    outline: none;
  }
  button:focus {
    outline: none;
  }
  button:disabled {
    opacity: 0.5;
  }
  .error {
    color: var(--error-color);
  }
</style>
