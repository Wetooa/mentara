<script lang="ts">
  let { className = '' }: { className?: string } = $props();
</script>

<section class="relative py-20 md:py-32 overflow-hidden {className}">
  <!-- Vibrant animated background -->
  <div class="absolute inset-0 -z-10">
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-teal-300/20 to-cyan-400/20 animate-gradient"></div>
    <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left: Text Content -->
      <div class="space-y-8 text-center lg:text-left">
        <!-- Main Heading -->
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold font-futura leading-tight">
          <span class="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Empowering Minds,
          </span>
          <span class="block text-foreground mt-2">
            Transforming Lives
          </span>
        </h1>

        <!-- Subheading -->
        <p class="text-xl md:text-2xl text-muted-foreground font-kollektif max-w-2xl mx-auto lg:mx-0">
          Crafting Safe Spaces Through Data-Driven Mental Health Solutions
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4">
          <a
            href="/demo"
            class="group px-8 py-4 rounded-xl text-lg font-semibold font-kollektif transition-all hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative overflow-hidden"
          >
            <span class="relative z-10">Book a Demo</span>
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </a>
          <a
            href="/about"
            class="px-8 py-4 rounded-xl text-lg font-semibold font-kollektif border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all"
          >
            Learn More
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 pt-8">
          <div class="text-center lg:text-left">
            <div class="text-4xl font-bold font-futura text-emerald-600">24/7</div>
            <p class="text-sm text-muted-foreground font-kollektif">Available</p>
          </div>
          <div class="text-center lg:text-left">
            <div class="text-4xl font-bold font-futura text-teal-600">100+</div>
            <p class="text-sm text-muted-foreground font-kollektif">Therapists</p>
          </div>
          <div class="text-center lg:text-left">
            <div class="text-4xl font-bold font-futura text-cyan-600">10k+</div>
            <p class="text-sm text-muted-foreground font-kollektif">Lives Helped</p>
          </div>
        </div>
      </div>

      <!-- Right: Hero Image -->
      <div class="relative">
        <div class="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <img
            src="/woman-flower-crown.png"
            alt="Mental health and wellness - woman with flowers"
            class="w-full h-auto object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
          
          <!-- Floating badge -->
          <div class="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <p class="text-sm font-kollektif text-emerald-700 font-semibold">
              ✨ Join 500+ organizations transforming workplace mental health
            </p>
          </div>
        </div>

        <!-- Decorative elements -->
        <div class="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl"></div>
        <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-500/20 rounded-full blur-xl"></div>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes gradient {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }

  .delay-1000 {
    animation-delay: 1s;
  }
</style>

