<script>
  export let style;
</script>

<span {style}>!</span>

<style>
  span {
    color: var(--danger-color);
    animation: blink 0.7s ease infinite alternate;
    text-align: center;
    border: 1px solid;
    border-radius: 50%;
    width: 2rem;
    min-width: 2rem;
    height: 2rem;
  }
</style>
