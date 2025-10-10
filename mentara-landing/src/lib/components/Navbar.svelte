<script lang="ts">
  import { page } from '$app/stores';
  
  let isMenuOpen = $state(false);

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function isActive(path: string): boolean {
    return $page.url.pathname === path;
  }
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center space-x-3">
        <img src="/icons/mentara/mentara-icon.png" alt="Mentara" class="h-10 w-10" />
        <div class="text-2xl font-bold" style="color: var(--primary);">
          <span class="font-futura">Mentara</span>
        </div>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        <a 
          href="/" 
          class="relative py-2 text-foreground transition-colors font-kollektif group"
          class:font-semibold={isActive('/')}
        >
          <span class="group-hover:opacity-80 transition-opacity" style="color: {isActive('/') ? 'var(--primary)' : 'inherit'};">
            Home
          </span>
          {#if isActive('/')}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style="background-color: var(--primary);"></div>
          {/if}
        </a>
        <a 
          href="/about" 
          class="relative py-2 text-foreground transition-colors font-kollektif group"
          class:font-semibold={isActive('/about')}
        >
          <span class="group-hover:opacity-80 transition-opacity" style="color: {isActive('/about') ? 'var(--primary)' : 'inherit'};">
            About
          </span>
          {#if isActive('/about')}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style="background-color: var(--primary);"></div>
          {/if}
        </a>
        <a 
          href="/services" 
          class="relative py-2 text-foreground transition-colors font-kollektif group"
          class:font-semibold={isActive('/services')}
        >
          <span class="group-hover:opacity-80 transition-opacity" style="color: {isActive('/services') ? 'var(--primary)' : 'inherit'};">
            Services
          </span>
          {#if isActive('/services')}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style="background-color: var(--primary);"></div>
          {/if}
        </a>
        <a 
          href="/demo" 
          class="px-6 py-2 rounded-lg font-kollektif font-semibold transition-all hover:shadow-lg hover:scale-105"
          style="background: linear-gradient(to right, var(--primary), var(--secondary)); color: var(--primary-foreground);"
        >
          Book a Demo
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button
        onclick={toggleMenu}
        class="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {#if isMenuOpen}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          {:else}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          {/if}
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    {#if isMenuOpen}
      <div class="md:hidden py-4 space-y-4 border-t border-border">
        <a
          href="/"
          class="block py-2 transition-colors font-kollektif"
          class:font-semibold={isActive('/')}
          style="color: {isActive('/') ? 'var(--primary)' : 'var(--foreground)'};"
        >
          Home {#if isActive('/')}✓{/if}
        </a>
        <a
          href="/about"
          class="block py-2 transition-colors font-kollektif"
          class:font-semibold={isActive('/about')}
          style="color: {isActive('/about') ? 'var(--primary)' : 'var(--foreground)'};"
        >
          About {#if isActive('/about')}✓{/if}
        </a>
        <a
          href="/services"
          class="block py-2 transition-colors font-kollektif"
          class:font-semibold={isActive('/services')}
          style="color: {isActive('/services') ? 'var(--primary)' : 'var(--foreground)'};"
        >
          Services {#if isActive('/services')}✓{/if}
        </a>
        <a
          href="/demo"
          class="block px-6 py-2 rounded-lg font-kollektif font-semibold text-center transition-all hover:shadow-lg"
          style="background: linear-gradient(to right, var(--primary), var(--secondary)); color: var(--primary-foreground);"
        >
          Book a Demo
        </a>
      </div>
    {/if}
  </div>
</nav>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-16"></div>

