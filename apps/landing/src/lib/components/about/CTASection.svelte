<script lang="ts">
  import AnimateOnScroll from "../AnimateOnScroll.svelte";
  import ParallaxDots from "../ParallaxDots.svelte";
</script>

<section class="py-20 relative" style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.12) 0%, oklch(0.98 0.0464 124.31 / 0.18) 100%);">
  <ParallaxDots variant="green" />
  <AnimateOnScroll y={30} duration={800}>
    {#snippet children()}
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          class="text-3xl md:text-5xl font-bold font-futura mb-6"
          style="color: var(--primary);"
        >
          Ready to Get Started?
        </h2>
        <p class="text-xl text-muted-foreground font-kollektif mb-8">
          Transform your organization's approach to mental health
        </p>
        <a
          href="/demo"
          class="inline-block px-10 py-4 rounded-xl text-lg font-semibold font-kollektif transition-all hover:shadow-2xl hover:scale-105 text-white"
          style="background: linear-gradient(to right, var(--primary), var(--secondary));"
        >
          Book a Demo
        </a>
      </div>
    {/snippet}
  </AnimateOnScroll>
</section>

