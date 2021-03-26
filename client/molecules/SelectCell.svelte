<script>
  import { __ } from '../utils/translator';
  export let options = [];
  export let value;
  export let name;
  $: hasIcons = options.some((o) => o.icon);
</script>

<td>
  <select class:fas={hasIcons} bind:value {name} on:change>
    {#each options as { value, label, icon }}
      <option class:fas={!!icon} {value}
        >{@html icon || ''}{$__(label) || ''}</option
      >
    {/each}
  </select>
</td>

<style>
  select {
    width: 100%;
    font-size: 2rem;
    line-height: 3.2rem;
    border-radius: 0.4rem;
    height: 3.2rem;
    font-family: 'boost-block', sans-serif;
  }
</style>
