<script>
  export let className = '';
  export let disabled;
  export let style;
  export let name;
  export let size = '';
  export let type;
  export let title;
</script>

<button
  {style}
  {title}
  {disabled}
  class="{className} {type} {size}"
  {name}
  on:click
>
  <slot />
</button>

<style>
  button {
    background-color: var(--corporate-grey);
    color: var(--bg-color);
    border: none;
    border-radius: 0.4rem;
    padding: 0.8rem 1.6rem;
  }
  button.outline {
    background-color: var(--bg-color);
    color: var(--corporate-grey-darken);
    border: 1px solid var(--corporate-grey-darken);
    box-shadow: none;
  }

  button.sm {
    padding: 0.8rem;
    font-size: 1.6rem;
  }

  button:disabled {
    opacity: 0.8;
  }

  button:active {
    transform: scale(0.95);
    outline: none;
  }

  button:focus {
    outline: none;
  }

  button :global(.icon) {
    font-size: 1.8rem;
  }
</style>
