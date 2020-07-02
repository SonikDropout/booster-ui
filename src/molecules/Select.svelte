<script>
  import { onMount, onDestroy } from 'svelte';
  export let onChange;
  export let options;
  export let disabled;
  export let defaultValue;
  export let title;
  export let order = 0;
  export let label;
  export let style;
  export let name;

  onMount(() => document.addEventListener('click', handleClickOutside));
  onDestroy(() => document.removeEventListener('click', handleClickOutside));

  function handleClickOutside(e) {
    if (optionsVisible && !select.contains(e.target)) optionsVisible = false;
  }

  let selected = options.find(o => o.value === defaultValue) || {
    label: '-- ne vybrano --',
  };

  let optionsVisible = false,
    select;
  const h = 50 * options.length;

  $: active = selected.value !== void 0;

  function toggleOptions() {
    if (disabled) return;
    optionsVisible = !optionsVisible;
  }

  function drop(node, { duration }) {
    return {
      duration,
      css: t => `max-height: ${t * h}%`,
    };
  }

  function selectOption(e) {
    optionsVisible = false;
    const v = e.target.dataset.value;
    selected = options.find(o => o.value == v);
    onChange(v, name);
  }
</script>

{#if label}
  <div class="label">{label}</div>
{/if}
<div class="select-wrapper" {style}>
  <div
    {title}
    class="select"
    style="z-index:{100 - order}"
    bind:this={select}
    class:disabled
    class:active
    class:expand={optionsVisible}>
    <div class="curr-value" on:click={toggleOptions}>{selected.label}</div>
    {#if optionsVisible}
      <ul transition:drop>
        {#each options as { icon, label, value }}
          <li data-value={value} on:click={selectOption}>
            {#if icon}
              <i class="icon icon-{icon}" />
            {/if}
            {label}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .label {
    margin-bottom: 0.8rem;
  }
  .select-wrapper {
    position: relative;
    height: 3.2rem;
    line-height: 3.2rem;
    width: 100%;
    margin-bottom: 1.2rem;
  }

  .select {
    width: 100%;
    position: absolute;
    top: 0;
    right: 0;
    border: 1px solid var(--corporate-blue-darken);
    border-radius: 4px;
    background-color: var(--bg-color);
  }

  .select.disabled {
    opacity: 0.8;
  }
  .select.active {
    background-color: var(--corporate-blue);
    color: var(--bg-color);
  }

  .curr-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .curr-value::after {
    content: '';
    display: block;
    border: 5px solid transparent;
    position: relative;
    top: 3px;
    border-top-color: var(--corporate-blue);
    transition: 0.3s ease;
  }
  .select.active .curr-value::after {
    border-top-color: var(--corporate-blue-darken);
  }
  .select.expand .curr-value::after {
    transform: rotate(180deg) translateY(5px);
  }

  .curr-value,
  li {
    padding: 0 1rem;
    line-height: 3.2rem;
    cursor: pointer;
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    padding: 0 2rem;
  }
</style>
