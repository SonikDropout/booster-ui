<script>
  import { __ } from '../utils/translator';
  import navItems from '../models/navMenu';
  let active = navItems[0].href;
  function activate(e) {
    active = new URL(e.currentTarget.href).hash;
  }
</script>

<nav>
  {#each navItems as { label, icon, href }, i}
    <a {href} class:active={href === active} on:click={activate}
      ><i class={icon} /><span class="mobile-hidden">{$__(label)}</span></a
    >
  {/each}
</nav>

<style>
  nav {
    background-color: var(--corporate-blue);
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
  }
  a {
    color: var(--bg-color);
    text-decoration: none;
    display: block;
    padding: 1.2rem 0.8rem;
  }
  a:hover {
    color: var(--bg-darken);
  }
  a.active {
    color: var(--bg-darken);
    background-color: var(--corporate-blue-darken);
  }
</style>
