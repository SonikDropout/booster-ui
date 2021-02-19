<script>
  export let value;
  export let name;
  export let type;
</script>

<td>
  {#if type === 'number'}
    <input type="number" bind:value {name} />
  {:else if type === 'text'}
    <input type="text" bind:value {name} />
  {/if}
</td>

<style>
  input {
    width: 100%;
    border: none;
    box-shadow: none;
  }
</style>
