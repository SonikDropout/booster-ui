<script>
  import { constraint } from '../../common/helpers';
  export let range = [0, 100];
  export let disabled;
  export let onChange;
  export let name;
  export let suggestedValue = range[0];
  export let style;
  export let step = 1;
  export let label;
  export let errorMessage = '';

  $: min = Math.min.apply(null, range);
  $: max = Math.max.apply(null, range);
  $: value = min;
  $: if (Math.abs(value - suggestedValue) > step && !updateBlocked)
    value = suggestedValue;

  function updateValue() {
    value = suggestedValue;
  }

  let timeout,
    interval,
    updateTimeout,
    updateBlocked,
    input,
    startX,
    showControls = false;

  $: precision = Math.max(0, -step.toExponential().split('e')[1]);

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
    clearTimers();
    timeout = setTimeout(() => {
      fn();
      interval = setInterval(fn, 50);
    }, 500);
  }

  function press(cb) {
    return function(e) {
      updateBlocked = true;
      stickyCall(cb);
      e.target.setPointerCapture(e.pointerId);
    };
  }

  function clearTimers() {
    clearInterval(interval);
    clearTimeout(timeout);
  }

  function release(e) {
    updateBlocked = false;
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
    value = Math.max(min, Math.min(max, +e.target.value));
    onChange(value, name);
  }

  function handleFocus(e) {
    updateBlocked = true;
    e.target.select();
  }

  function handleKeyPress(e) {
    if (e.code == 'Enter' || e.code == 'Tab') {
      e.target.blur();
      setTimeout(() => (e.target.value = value));
      updateBlocked = false;
    }
  }
</script>

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
  <span class="input-wrapper" class:disabled>
    <button
      disabled={value <= min || disabled}
      tabindex="-1"
      class="decrementer"
      on:pointerdown={press(decrement)}
      on:pointercancel={release}
      on:pointerup={release}>
      <span>-</span>
    </button>
    <input
      on:focus={handleFocus}
      on:blur={() => (updateBlocked = false)}
      on:keypress={handleKeyPress}
      type="number"
      {min}
      {max}
      {step}
      {name}
      bind:this={input}
      value={value.toFixed(precision)}
      on:change={handleInputChange} />
    <button
      disabled={value >= max || disabled}
      tabindex="-1"
      class="incrementer"
      on:pointerdown={press(increment)}
      on:pointercancel={release}
      on:pointerup={release}>
      <span>+</span>
    </button>
  </span>

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
    color: var(--danger-color);
    font-size: 0.8rem;
    display: block;
    animation: blink 0.7s ease infinite alternate;
  }
</style>
