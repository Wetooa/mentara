<script lang="ts">
  let { className = '' }: { className?: string } = $props();
</script>

<section class="relative py-20 md:py-32 overflow-hidden {className}">
  <!-- Background gradient -->
  <div class="absolute inset-0 -z-10">
    <div class="absolute inset-0 bg-gradient-to-br from-community-warm via-background to-community-calm opacity-30"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center space-y-8">
      <!-- Main Heading -->
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold font-futura">
        <span class="block" style="color: var(--primary);">
          Empowering Minds,
        </span>
        <span class="block text-foreground mt-2">
          Transforming Lives
        </span>
      </h1>

      <!-- Subheading -->
      <p class="text-xl md:text-2xl text-muted-foreground font-kollektif max-w-3xl mx-auto">
        Crafting Safe Spaces Through Data-Driven Mental Health Solutions
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
        <a
          href="/demo"
          class="px-8 py-4 rounded-lg text-lg font-semibold font-kollektif transition-all hover:shadow-xl hover:scale-105"
          style="background-color: var(--primary); color: var(--primary-foreground);"
        >
          Book a Demo
        </a>
        <a
          href="/about"
          class="px-8 py-4 rounded-lg text-lg font-semibold font-kollektif border-2 transition-all hover:bg-muted"
          style="border-color: var(--primary); color: var(--primary);"
        >
          Learn More
        </a>
      </div>

      <!-- Stats or Key Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
        <div class="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-border">
          <div class="text-4xl font-bold font-futura mb-2" style="color: var(--primary);">
            24/7
          </div>
          <p class="text-muted-foreground font-kollektif">
            Access to Mental Health Resources
          </p>
        </div>

        <div class="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-border">
          <div class="text-4xl font-bold font-futura mb-2" style="color: var(--primary);">
            100+
          </div>
          <p class="text-muted-foreground font-kollektif">
            Licensed Therapists
          </p>
        </div>

        <div class="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-border">
          <div class="text-4xl font-bold font-futura mb-2" style="color: var(--primary);">
            10k+
          </div>
          <p class="text-muted-foreground font-kollektif">
            Lives Transformed
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

