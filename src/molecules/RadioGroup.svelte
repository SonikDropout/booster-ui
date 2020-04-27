<script>
  export let group;
  export let type;
  export let value;
</script>

<div class="radio-group {type}">
  {#each group.elements as element}
    <label>
      <input
        class="hidden"
        type="radio"
        name={group.name}
        on:change
        checked={element.value == value}
        value={element.value}
        disabled={element.disabled} />
      <span>
        {@html element.label}
      </span>
    </label>
  {/each}
</div>

<style>
  .radio-group.horizontal {
    display: flex;
  }
  input:checked + span {
    transform: scaleX(1.05);
    opacity: 1;
    border-radius: 4px;
  }
  span {
    display: block;
    padding: 1rem 2rem;
    color: var(--bg-color);
    font-weight: 500;
    background-color: var(--corporate-blue);
    opacity: 0.6;
  }
  .icon {
    height: 1.6rem;
    vertical-align: middle;
    filter: invert(100%);
  }
  label:first-child span {
    border-radius: 4px 4px 0 0;
  }
  label:last-child span {
    border-radius: 0 0 4px 4px;
  }
</style>
