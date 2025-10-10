<script lang="ts">
  import { onMount } from 'svelte';

  let { variant = 'green' }: { variant?: 'green' | 'white' } = $props();
  let scrollY = $state(0);

  onMount(() => {
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<div class="absolute inset-0 overflow-hidden pointer-events-none">
  <!-- Large dots -->
  <div
    class="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
    style="
      top: 10%;
      left: -5%;
      background-color: {variant === 'green' ? 'var(--primary)' : 'var(--secondary)'};
      transform: translateY({scrollY * 0.1}px);
    "
  ></div>
  
  <div
    class="absolute w-96 h-96 rounded-full blur-3xl opacity-15"
    style="
      top: 40%;
      right: -10%;
      background-color: {variant === 'green' ? 'var(--secondary)' : 'var(--primary)'};
      transform: translateY({scrollY * 0.15}px);
    "
  ></div>

  <div
    class="absolute w-48 h-48 rounded-full blur-2xl opacity-25"
    style="
      bottom: 20%;
      left: 10%;
      background-color: {variant === 'green' ? 'oklch(0.98 0.0464 124.31)' : 'var(--primary)'};
      transform: translateY({scrollY * -0.08}px);
    "
  ></div>

  <!-- Small decorative circles -->
  <div
    class="absolute w-3 h-3 rounded-full"
    style="
      top: 15%;
      right: 20%;
      background-color: {variant === 'green' ? 'var(--primary)' : 'var(--secondary)'};
      opacity: 0.3;
      transform: translateY({scrollY * 0.2}px);
    "
  ></div>

  <div
    class="absolute w-2 h-2 rounded-full"
    style="
      top: 60%;
      left: 15%;
      background-color: {variant === 'green' ? 'var(--secondary)' : 'var(--primary)'};
      opacity: 0.4;
      transform: translateY({scrollY * -0.12}px);
    "
  ></div>

  <div
    class="absolute w-4 h-4 rounded-full"
    style="
      bottom: 30%;
      right: 15%;
      background-color: {variant === 'green' ? 'oklch(0.98 0.0464 124.31)' : 'var(--primary)'};
      opacity: 0.35;
      transform: translateY({scrollY * 0.18}px);
    "
  ></div>

  <!-- Medium circles -->
  <div
    class="absolute w-8 h-8 rounded-full opacity-20"
    style="
      top: 25%;
      left: 5%;
      background-color: {variant === 'green' ? 'var(--primary)' : 'var(--secondary)'};
      transform: translateY({scrollY * 0.12}px);
    "
  ></div>

  <div
    class="absolute w-6 h-6 rounded-full opacity-25"
    style="
      bottom: 40%;
      right: 8%;
      background-color: {variant === 'green' ? 'var(--secondary)' : 'oklch(0.98 0.0464 124.31)'};
      transform: translateY({scrollY * -0.1}px);
    "
  ></div>
</div>

