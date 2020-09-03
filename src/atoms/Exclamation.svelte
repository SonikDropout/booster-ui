<script>
  export let style;
  export let size = "md";
</script>

<span {style} class={size}>!</span>

<style>
  span {
    display: inline-block;
    color: var(--danger-color);
    animation: blink 0.7s ease infinite alternate;
    text-align: center;
    border: 1px solid;
    border-radius: 50%;
    width: 2rem;
    min-width: 2rem;
    height: 2rem;
  }
  span.lg {
    width: 3rem;
    height: 3rem;
    line-height: 3rem;
    font-size: 2.4rem;
  }
</style>
