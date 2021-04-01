<script>
  export let size = 'md';
</script>

<img src="../icons/spinner.svg" alt="spinner" class={size}/>

<style>
  img {
    animation: 1s spin ease-in infinite reverse;
  }
  img.lg {
    width: 10rem;
  }
</style>