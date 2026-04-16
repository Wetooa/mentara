<script lang="ts">
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';

  let { 
    value, 
    duration = 2000,
    suffix = '',
    className = ''
  }: {
    value: number | string;
    duration?: number;
    suffix?: string;
    className?: string;
  } = $props();

  let displayValue = $state(0);
  let hasAnimated = $state(false);
  let element: HTMLElement;

  // Parse the target value (handle cases like "10k+", "24/7", etc)
  function parseValue(val: number | string): number {
    if (typeof val === 'number') return val;
    const numMatch = val.match(/\d+/);
    return numMatch ? parseInt(numMatch[0]) : 0;
  }

  const targetValue = parseValue(value);

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            animateCount();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  });

  function animateCount() {
    const start = 0;
    const end = targetValue;
    const startTime = Date.now();

    function update() {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      displayValue = Math.floor(start + (end - start) * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        displayValue = end;
      }
    }

    requestAnimationFrame(update);
  }
</script>

<span bind:this={element} class={className}>
  {displayValue}{suffix}
</span>

