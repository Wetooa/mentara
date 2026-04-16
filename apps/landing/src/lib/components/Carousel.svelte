<script lang="ts">
  import ImageLightbox from "./ImageLightbox.svelte";

  let {
    images,
    alts,
  }: {
    images: string[];
    alts: string[];
  } = $props();

  let currentIndex = $state(0);
  let carouselElement: HTMLDivElement;
  let lightboxOpen = $state(false);
  let lightboxSrc = $state("");
  let lightboxAlt = $state("");

  function nextSlide() {
    currentIndex = (currentIndex + 1) % images.length;
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  function goToSlide(index: number) {
    currentIndex = index;
  }

  function openLightbox(src: string, alt: string) {
    lightboxSrc = src;
    lightboxAlt = alt;
    lightboxOpen = true;
  }
</script>

<div class="relative rounded-2xl overflow-hidden" bind:this={carouselElement}>
  <!-- Carousel Content -->
  <div class="relative">
    {#each images as image, index}
      <div
        class="transition-opacity duration-500"
        class:opacity-100={currentIndex === index}
        class:opacity-0={currentIndex !== index}
        class:absolute={currentIndex !== index}
        class:inset-0={currentIndex !== index}
        class:relative={currentIndex === index}
        style:pointer-events={currentIndex === index ? "auto" : "none"}
      >
        <div
          class="relative rounded-2xl shadow-2xl border-2 group overflow-hidden cursor-zoom-in"
          style="border-color: var(--primary); border-opacity: 0.2;"
          onclick={() => openLightbox(image, alts[index])}
          role="button"
          tabindex="0"
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              openLightbox(image, alts[index]);
            }
          }}
        >
          <img
            src={image}
            alt={alts[index]}
            class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-[oklch(0.56_0.1223_127.47)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>
          <!-- Zoom hint icon -->
          <div
            class="absolute top-4 right-4 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5"
              style="color: var(--primary);"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
              />
            </svg>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Navigation (only show if multiple images) -->
  {#if images.length > 1}
    <!-- Previous Button -->
    <button
      onclick={prevSlide}
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
      style="color: var(--primary);"
      aria-label="Previous slide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>

    <!-- Next Button -->
    <button
      onclick={nextSlide}
      class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
      style="color: var(--primary);"
      aria-label="Next slide"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>

    <!-- Dots Indicator -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      {#each images as _, index}
        <button
          onclick={() => goToSlide(index)}
          class="h-2 rounded-full transition-all {currentIndex === index
            ? 'w-8 bg-white'
            : 'w-2 bg-white/40'}"
          aria-label={`Go to slide ${index + 1}`}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<ImageLightbox src={lightboxSrc} alt={lightboxAlt} bind:isOpen={lightboxOpen} />
