<script>
  export let name;
  export let label;
  export let defaultValue = '';
</script>

<label>
  <span class="label">{label}</span>
  <input {name} on:change class="input" value={defaultValue} />
</label>

<style>
  label {
    display: flex;
    margin-bottom: 1.2rem;
  }
  input {
    border-radius: .4rem;
    height: 3.2rem;
    padding: 0 1.2rem;
    border: 1px solid var(--corporate-grey);
    margin-left: auto;
  }
  input:focus {
    border-color: var(--corporate-blue);
    outline: var(--corporte-blue);
  }
</style>
