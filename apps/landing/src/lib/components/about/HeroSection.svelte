<script lang="ts">
  import AnimateOnScroll from "../AnimateOnScroll.svelte";
  import ParallaxDots from "../ParallaxDots.svelte";
</script>

<section class="py-20 md:py-32 relative bg-white">
  <ParallaxDots variant="white" />
  <div class="absolute inset-0 -z-10">
    <div
      class="absolute inset-0 bg-gradient-to-br from-white via-[oklch(0.98_0.0464_124.31)]/10 to-white"
    ></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <AnimateOnScroll y={30} duration={800}>
      {#snippet children()}
        <div class="text-center max-w-4xl mx-auto">
          <div
            class="inline-block px-4 py-2 rounded-full mb-6"
            style="background-color: oklch(0.98 0.0464 124.31);"
          >
            <span
              class="font-semibold font-kollektif text-sm"
              style="color: var(--primary);">About Mentara</span
            >
          </div>
          <h1
            class="text-4xl md:text-6xl font-bold font-futura mb-6 bg-gradient-to-r bg-clip-text text-transparent"
            style="background-image: linear-gradient(to right, var(--primary), var(--secondary));"
          >
            Transforming Mental Health Care with Technology
          </h1>
          <p
            class="text-xl text-muted-foreground font-kollektif leading-relaxed"
          >
            Mentara is a comprehensive mental health platform designed to
            provide accessible, data-driven mental health support for
            individuals and organizations.
          </p>
        </div>
      {/snippet}
    </AnimateOnScroll>
  </div>
</section>
