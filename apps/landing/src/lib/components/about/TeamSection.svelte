<script lang="ts">
  import AnimateOnScroll from "../AnimateOnScroll.svelte";
  import ParallaxDots from "../ParallaxDots.svelte";
</script>

<section
  class="py-20 relative"
  style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.08) 0%, oklch(0.98 0.0464 124.31 / 0.12) 100%);"
>
  <ParallaxDots variant="green" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <AnimateOnScroll y={30} duration={600}>
      {#snippet children()}
        <div class="text-center mb-16">
          <h2
            class="text-3xl md:text-5xl font-bold font-futura mb-4"
            style="color: var(--primary);"
          >
            Meet Our Team
          </h2>
          <p
            class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto"
          >
            The passionate individuals behind Mentara
          </p>
        </div>
      {/snippet}
    </AnimateOnScroll>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Team Member 1 -->
      <AnimateOnScroll y={40} duration={600} delay={100}>
        {#snippet children()}
          <div class="text-center group">
            <div class="relative mb-6 overflow-hidden rounded-2xl">
              <img
                src="/team/tolentino.jpg"
                alt="Tristan James C. Tolentino"
                class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
            </div>
            <h3
              class="text-xl font-bold font-futura mb-2"
              style="color: var(--primary);"
            >
              Tristan James C. Tolentino
            </h3>
            <p class="text-muted-foreground font-kollektif text-sm mb-3">
              Co-Founder & External Partnerships Lead
            </p>
            <p class="text-xs text-muted-foreground font-kollektif">
              Leading strategic partnerships and business development to expand
              Mentara's reach and impact in mental health care.
            </p>
          </div>
        {/snippet}
      </AnimateOnScroll>

      <!-- Team Member 2 -->
      <AnimateOnScroll y={40} duration={600} delay={200}>
        {#snippet children()}
          <div class="text-center group">
            <div class="relative mb-6 overflow-hidden rounded-2xl">
              <img
                src="/team/sajulga.jpg"
                alt="Adrian T. Sajulga"
                class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
            </div>
            <h3
              class="text-xl font-bold font-futura mb-2"
              style="color: var(--primary);"
            >
              Adrian T. Sajulga
            </h3>
            <p class="text-muted-foreground font-kollektif text-sm mb-3">
              Co-Founder & Backend Architect
            </p>
            <p class="text-xs text-muted-foreground font-kollektif">
              Backend specialist focused on building scalable, secure
              infrastructure for mental health services.
            </p>
          </div>
        {/snippet}
      </AnimateOnScroll>

      <!-- Team Member 3 -->
      <AnimateOnScroll y={40} duration={600} delay={300}>
        {#snippet children()}
          <div class="text-center group">
            <div class="relative mb-6 overflow-hidden rounded-2xl">
              <img
                src="/team/segundo.jpg"
                alt="Julia Laine Segundo"
                class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
            </div>
            <h3
              class="text-xl font-bold font-futura mb-2"
              style="color: var(--primary);"
            >
              Julia Laine Segundo
            </h3>
            <p class="text-muted-foreground font-kollektif text-sm mb-3">
              Co-Founder & AI Engineer
            </p>
            <p class="text-xs text-muted-foreground font-kollektif">
              Machine learning expert developing AI-powered assessment and
              evaluation systems.
            </p>
          </div>
        {/snippet}
      </AnimateOnScroll>
    </div>
  </div>
</section>
