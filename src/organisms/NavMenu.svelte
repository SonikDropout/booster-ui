<script>
  import { __ } from '../utils/translator';
  let navItems = [
    {
      label: 'parameters',
      icon: 'fas fa-cogs',
      href: '#parameters',
      active: true,
    },
    {
      label: 'charts',
      icon: 'fas fa-chart-line',
      href: '#charts',
      active: false,
    },
    {
      label: 'settings',
      icon: 'fas fa-cog',
      href: '#settings',
      active: false,
    },
    {
      label: 'script',
      icon: 'fas fa-terminal',
      href: '#script',
      active: false,
    },
  ];
  function activate(id) {
    return function activator() {
      navItems.forEach((a, i) => (a.active = i === id));
      navItems = navItems; // trigger render
    };
  }
</script>

<nav>
  {#each navItems as { label, icon, href, active }, i}
    <a {href} class:active on:click={activate(i)}
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
    font-size: 2rem;
  }
  a:hover {
    color: var(--bg-darken);
  }
  a.active {
    color: var(--bg-darken);
    background-color: var(--corporate-blue-darken);
  }
</style>
