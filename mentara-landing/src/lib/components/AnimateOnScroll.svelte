<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly, scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let {
    children,
    delay = 0,
    duration = 600,
    y = 30,
    x = 0,
    scaleAmount = 1,
    once = true,
    className = "",
  }: {
    children: any;
    delay?: number;
    duration?: number;
    y?: number;
    x?: number;
    scaleAmount?: number;
    once?: boolean;
    className?: string;
  } = $props();

  let isVisible = $state(false);
  let hasAnimated = $state(false);
  let element: HTMLElement;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!hasAnimated || !once)) {
            isVisible = true;
            if (once) hasAnimated = true;
          } else if (!once) {
            isVisible = false;
          }
        });
      },
      { threshold: 0.1 }
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
</script>

<div bind:this={element} class={className + " overflow-visible"}>
  {#if isVisible}
    <div in:fly={{ y, x, duration, delay, easing: cubicOut }}>
      {@render children()}
    </div>
  {:else}
    <div style="opacity: 0;">
      {@render children()}
    </div>
  {/if}
</div>
