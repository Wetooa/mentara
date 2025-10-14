<script lang="ts">
  import AnimateOnScroll from "./AnimateOnScroll.svelte";
  import Carousel from "./Carousel.svelte";

  let {
    badge,
    title,
    description,
    features,
    imageSrc,
    imageAlt,
    imageSrcs,
    imageAlts,
    imagePosition = "right",
  }: {
    badge: string;
    title: string;
    description: string;
    features: string[];
    imageSrc?: string;
    imageAlt?: string;
    imageSrcs?: string[];
    imageAlts?: string[];
    imagePosition?: "left" | "right";
  } = $props();

  const isImageRight = imagePosition === "right";

  // Always use carousel - convert single image to array if needed
  const images = imageSrcs || (imageSrc ? [imageSrc] : []);
  const alts = imageAlts || (imageAlt ? [imageAlt] : []);
</script>

<AnimateOnScroll y={50} duration={800}>
  {#snippet children()}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Text Content -->
      <div class:lg:order-1={isImageRight} class:lg:order-2={!isImageRight}>
        <div
          class="inline-block px-3 py-1 rounded-full mb-4"
          style="background-color: oklch(0.98 0.0464 124.31);"
        >
          <span
            class="text-xs font-semibold font-kollektif"
            style="color: var(--primary);">{badge}</span
          >
        </div>
        <h3
          class="text-3xl md:text-4xl font-bold font-futura mb-4"
          style="color: var(--primary);"
        >
          {title}
        </h3>
        <p
          class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
        >
          {description}
        </p>
        <ul class="space-y-3">
          {#each features as feature}
            <li class="flex items-start">
              <span class="mr-2 mt-1" style="color: var(--primary);">✓</span>
              <span class="text-muted-foreground font-kollektif">{feature}</span
              >
            </li>
          {/each}
        </ul>
      </div>

      <!-- Image -->
      <div class:lg:order-2={isImageRight} class:lg:order-1={!isImageRight}>
        <Carousel {images} {alts} />
      </div>
    </div>
  {/snippet}
</AnimateOnScroll>
