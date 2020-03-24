<script>
  export let checked;
  export let value;
  export let name;
  export let disabled;
</script>

<label>
  <slot />
  <input type="checkbox" {value} {name} on:change bind:checked {disabled} />
  <span class:disabled class:checked>{checked ? 'вкл' : 'выкл'}</span>
</label>

<style>
  input {
    position: absolute;
    top: -9999px;
    left: -9999px;
    visibility: hidden;
  }
  span {
    display: inline-block;
    width: 5rem;
    background-color: var(--corporate-grey);
    border-radius: 2rem;
    height: 2rem;
    position: relative;
    color: var(--bg-color);
    text-align: right;
    font-size: 1rem;
    line-height: 2rem;
    padding: 0 0.4rem;
  }
  span.checked {
    text-align: left;
  }
  span.disabled {
    opacity: 0.6;
  }
  span::after {
    position: absolute;
    top: 2px;
    left: 2px;
    content: '';
    border-radius: 50%;
    height: calc(2rem - 4px);
    width: calc(2rem - 4px);
    background-color: var(--bg-color);
    transition: 0.2s ease;
  }
  input:checked + span {
    background-color: var(--corporate-blue);
  }
  input:checked + span::after {
    transform: translateX(3rem);
  }
</style>
