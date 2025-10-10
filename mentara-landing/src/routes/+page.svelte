<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import AnimateOnScroll from "$lib/components/AnimateOnScroll.svelte";
</script>

<svelte:head>
  <title>Mentara - Empowering Minds, Transforming Lives</title>
  <meta
    name="description"
    content="Mentara provides data-driven mental health solutions with 24/7 access to licensed therapists and comprehensive mental health resources."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <Navbar />

  <main>
    <Hero />

    <!-- Features Section -->
    <section class="py-20 relative">
      <!-- Gradient background -->
      <div class="absolute inset-0 -z-10">
        <div
          class="absolute inset-0 bg-gradient-to-b from-white via-[oklch(0.98_0.0464_124.31)]/10 to-white"
        ></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll y={30} duration={600}>
          {#snippet children()}
            <div class="text-center mb-16">
              <AnimateOnScroll scaleAmount={0.8} duration={500} delay={200}>
                {#snippet children()}
                  <div
                    class="inline-block px-4 py-2 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="font-semibold font-kollektif text-sm"
                      style="color: var(--primary);">Why Choose Mentara</span
                    >
                  </div>
                {/snippet}
              </AnimateOnScroll>
              <AnimateOnScroll y={20} duration={600} delay={300}>
                {#snippet children()}
                  <h2
                    class="text-4xl md:text-5xl font-bold font-futura mb-4 bg-gradient-to-r bg-clip-text text-transparent"
                    style="background-image: linear-gradient(to right, var(--primary), var(--secondary));"
                  >
                    Our Approach
                  </h2>
                {/snippet}
              </AnimateOnScroll>
              <AnimateOnScroll y={20} duration={600} delay={400}>
                {#snippet children()}
                  <p
                    class="text-xl text-muted-foreground font-kollektif max-w-2xl mx-auto"
                  >
                    A comprehensive mental health solution tailored to your
                    needs
                  </p>
                {/snippet}
              </AnimateOnScroll>
            </div>
          {/snippet}
        </AnimateOnScroll>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <AnimateOnScroll y={50} duration={600} delay={100}>
            {#snippet children()}
              <div
                class="group p-8 rounded-2xl bg-gradient-to-br border-2 hover:shadow-2xl hover:-translate-y-2 transition-all"
                style="background: linear-gradient(135deg, oklch(0.98 0.0464 124.31) 0%, oklch(0.95 0.04 124 / 0.5) 100%); border-color: var(--primary); border-opacity: 0.2;"
              >
                <div
                  class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3
                  class="text-2xl font-bold font-futura mb-3"
                  style="color: var(--primary);"
                >
                  Education & Awareness
                </h3>
                <p
                  class="font-kollektif leading-relaxed"
                  style="color: var(--secondary);"
                >
                  Reducing stigma and normalizing mental health through
                  comprehensive resources and tools for personal development.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Feature 2 -->
          <AnimateOnScroll y={50} duration={600} delay={200}>
            {#snippet children()}
              <div
                class="group p-8 rounded-2xl bg-gradient-to-br border-2 hover:shadow-2xl hover:-translate-y-2 transition-all"
                style="background: linear-gradient(135deg, oklch(0.98 0.0464 124.31) 0%, oklch(0.95 0.04 124 / 0.5) 100%); border-color: var(--primary); border-opacity: 0.2;"
              >
                <div
                  class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3
                  class="text-2xl font-bold font-futura mb-3"
                  style="color: var(--primary);"
                >
                  Diagnostic Approach
                </h3>
                <p
                  class="font-kollektif leading-relaxed"
                  style="color: var(--secondary);"
                >
                  Make better business decisions with insights from qualitative
                  and quantitative mental health data.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Feature 3 -->
          <AnimateOnScroll y={50} duration={600} delay={300}>
            {#snippet children()}
              <div
                class="group p-8 rounded-2xl bg-gradient-to-br border-2 hover:shadow-2xl hover:-translate-y-2 transition-all"
                style="background: linear-gradient(135deg, oklch(0.98 0.0464 124.31) 0%, oklch(0.95 0.04 124 / 0.5) 100%); border-color: var(--primary); border-opacity: 0.2;"
              >
                <div
                  class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3
                  class="text-2xl font-bold font-futura mb-3"
                  style="color: var(--primary);"
                >
                  Convenient Access
                </h3>
                <p
                  class="font-kollektif leading-relaxed"
                  style="color: var(--secondary);"
                >
                  24/7 access to mental health resources, talk therapy
                  scheduling, and coaching in one seamless ecosystem.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <AnimateOnScroll scaleAmount={0.95} duration={800}>
        {#snippet children()}
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimateOnScroll y={30} duration={600} delay={200}>
              {#snippet children()}
                <h2
                  class="text-3xl md:text-5xl font-bold font-futura mb-6 bg-gradient-to-r bg-clip-text text-transparent"
                  style="background-image: linear-gradient(to right, var(--primary), var(--secondary));"
                >
                  Ready to Transform Your Organization?
                </h2>
              {/snippet}
            </AnimateOnScroll>
            <AnimateOnScroll y={20} duration={600} delay={400}>
              {#snippet children()}
                <p class="text-xl text-muted-foreground font-kollektif mb-8">
                  Book a demo to see how Mentara can help create a mentally
                  healthy workplace
                </p>
              {/snippet}
            </AnimateOnScroll>
            <AnimateOnScroll y={20} duration={600} delay={600}>
              {#snippet children()}
                <a
                  href="/demo"
                  class="inline-block px-10 py-4 rounded-xl text-xl font-semibold font-kollektif transition-all shadow-xl hover:scale-105 text-white"
                  style="background: linear-gradient(to right, var(--primary), var(--secondary));"
                >
                  Book a Demo
                </a>
              {/snippet}
            </AnimateOnScroll>
          </div>
        {/snippet}
      </AnimateOnScroll>
    </section>
  </main>

  <!-- Footer -->
  <footer class="py-12 border-t border-border bg-muted/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <div
          class="text-2xl font-bold font-futura mb-4"
          style="color: var(--primary);"
        >
          Mentara
        </div>
        <p class="text-muted-foreground font-kollektif mb-4">
          Empowering Minds, Transforming Lives
        </p>
        <p class="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mentara. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
