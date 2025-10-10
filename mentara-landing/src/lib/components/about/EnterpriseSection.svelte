<script lang="ts">
  import AnimateOnScroll from "../AnimateOnScroll.svelte";
  import ParallaxDots from "../ParallaxDots.svelte";
</script>

<section
  class="py-20 relative"
  style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.15) 0%, oklch(0.98 0.0464 124.31 / 0.05) 100%);"
>
  <ParallaxDots variant="green" />
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <AnimateOnScroll x={-40} duration={800}>
        {#snippet children()}
          <div class="relative rounded-2xl shadow-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop"
              alt="Team collaboration and analytics"
              class="w-full h-auto object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            ></div>
            <div class="absolute bottom-6 left-6 right-6 text-white">
              <p class="text-2xl font-bold font-futura">
                Enterprise-Grade Platform
              </p>
              <p class="text-sm mt-2 font-kollektif">
                Built for scale and reliability
              </p>
            </div>
          </div>
        {/snippet}
      </AnimateOnScroll>

      <AnimateOnScroll x={40} duration={800}>
        {#snippet children()}
          <div>
            <div
              class="inline-block px-3 py-1 rounded-full mb-4"
              style="background-color: oklch(0.98 0.0464 124.31);"
            >
              <span
                class="text-xs font-semibold font-kollektif"
                style="color: var(--primary);">Enterprise Ready</span
              >
            </div>
            <h2
              class="text-3xl md:text-4xl font-bold font-futura mb-6"
              style="color: var(--primary);"
            >
              Built for Organizations
            </h2>
            <div class="space-y-4 text-muted-foreground font-kollektif">
              <p class="text-lg leading-relaxed">
                Mentara implements a robust <strong
                  >microservices architecture</strong
                > designed for enterprise scalability and reliability. Our platform
                handles thousands of concurrent users while maintaining sub-100ms
                API response times.
              </p>
              <div class="grid grid-cols-2 gap-4 pt-4">
                <div
                  class="p-4 rounded-xl border"
                  style="border-color: var(--primary); border-opacity: 0.2;"
                >
                  <div
                    class="text-2xl font-bold font-futura mb-1"
                    style="color: var(--primary);"
                  >
                    140+
                  </div>
                  <div class="text-sm">API Endpoints</div>
                </div>
                <div
                  class="p-4 rounded-xl border"
                  style="border-color: var(--primary); border-opacity: 0.2;"
                >
                  <div
                    class="text-2xl font-bold font-futura mb-1"
                    style="color: var(--primary);"
                  >
                    17
                  </div>
                  <div class="text-sm">Service Modules</div>
                </div>
                <div
                  class="p-4 rounded-xl border"
                  style="border-color: var(--primary); border-opacity: 0.2;"
                >
                  <div
                    class="text-2xl font-bold font-futura mb-1"
                    style="color: var(--primary);"
                  >
                    99.9%
                  </div>
                  <div class="text-sm">Uptime SLA</div>
                </div>
                <div
                  class="p-4 rounded-xl border"
                  style="border-color: var(--primary); border-opacity: 0.2;"
                >
                  <div
                    class="text-2xl font-bold font-futura mb-1"
                    style="color: var(--primary);"
                  >
                    &lt;100ms
                  </div>
                  <div class="text-sm">API Response</div>
                </div>
              </div>
            </div>
          </div>
        {/snippet}
      </AnimateOnScroll>
    </div>
  </div>
</section>
