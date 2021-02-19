<script>
  import { __ } from '../utils/translator';
  export let options = [];
  export let value;
  export let name;
</script>

<td>
  <select bind:value {name} on:change>
    {#each options as { value, label, icon }}
      <option {value}>{$__(label) || ''}{icon || ''}</option>
    {/each}
  </select>
</td>

<style>
  select {
    width: 100%;
    border: none;
  }
</style>
