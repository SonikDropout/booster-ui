<script>
  export let label = '';
</script>

<label>
  <span class="label">{label}</span>
  <input on:change class="input" class:short={$$props.type === 'number'} {...$$props} />
</label>

<style>
  label {
    display: flex;
    margin-bottom: 1.2rem;
    justify-content: space-between;
  }
  input.short {
    width: 8rem;
  }
</style>
