<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import CountUpNumber from "./CountUpNumber.svelte";

  let { className = "" }: { className?: string } = $props();
  let isHovering = $state(false);
</script>

<section class="relative py-20 md:py-32 overflow-hidden {className}">
  <!-- Vibrant animated background with green tint -->
  <div class="absolute inset-0 -z-10">
    <div
      class="absolute inset-0 bg-gradient-to-br from-[oklch(0.56_0.1223_127.47)]/15 via-[oklch(0.98_0.0464_124.31)]/20 to-white animate-gradient"
    ></div>
    <div
      class="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse"
      style="background-color: oklch(0.56 0.1223 127.47 / 0.08);"
    ></div>
    <div
      class="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
      style="background-color: oklch(0.4 0.0812 92.8 / 0.08);"
    ></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left: Text Content -->
      <div
        class="space-y-8 text-center lg:text-left"
        in:fly={{ x: -50, duration: 800, delay: 0, easing: cubicOut }}
      >
        <!-- Main Heading -->
        <h1
          class="text-5xl md:text-6xl lg:text-7xl font-bold font-futura leading-tight"
          in:fly={{ y: 20, duration: 600, delay: 200, easing: cubicOut }}
        >
          <span
            class="block bg-gradient-to-r bg-clip-text text-transparent"
            style="background-image: linear-gradient(to right, var(--primary), var(--secondary));"
          >
            Empowering Minds,
          </span>
          <span class="block text-foreground mt-2"> Transforming Lives </span>
        </h1>

        <!-- Subheading -->
        <p
          class="text-xl md:text-2xl text-muted-foreground font-kollektif max-w-2xl mx-auto lg:mx-0"
          in:fly={{ y: 20, duration: 600, delay: 400, easing: cubicOut }}
        >
          Crafting Safe Spaces Through Data-Driven Mental Health Solutions
        </p>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4"
          in:fly={{ y: 20, duration: 600, delay: 600, easing: cubicOut }}
        >
          <a
            href="/demo"
            class="group px-8 py-4 rounded-xl text-lg font-semibold font-kollektif transition-all hover:shadow-2xl hover:scale-105 text-white relative overflow-hidden"
            style="background: linear-gradient(to right, var(--primary), var(--secondary));"
          >
            <span class="relative z-10">Book a Demo</span>
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style="background: linear-gradient(to right, var(--secondary), var(--primary));"
            ></div>
          </a>
          <a
            href="/about"
            class="px-8 py-4 rounded-xl text-lg font-semibold font-kollektif border-2 transition-all"
            style="border-color: var(--primary); color: var(--primary);"
          >
            Learn More
          </a>
        </div>

        <!-- Stats -->
        <div
          class="grid grid-cols-3 gap-4 pt-8"
          in:fly={{ y: 20, duration: 600, delay: 800, easing: cubicOut }}
        >
          <div class="text-center lg:text-left">
            <div
              class="text-4xl font-bold font-futura"
              style="color: var(--primary);"
            >
              24/7
            </div>
            <p class="text-sm text-muted-foreground font-kollektif">
              Available
            </p>
          </div>
          <div class="text-center lg:text-left">
            <div
              class="text-4xl font-bold font-futura"
              style="color: var(--primary);"
            >
              <CountUpNumber value={100} suffix="+" />
            </div>
            <p class="text-sm text-muted-foreground font-kollektif">
              Therapists
            </p>
          </div>
          <div class="text-center lg:text-left">
            <div
              class="text-4xl font-bold font-futura"
              style="color: var(--primary);"
            >
              <CountUpNumber value={10} suffix="k+" />
            </div>
            <p class="text-sm text-muted-foreground font-kollektif">
              Lives Helped
            </p>
          </div>
        </div>
      </div>

      <!-- Right: Hero Image -->
      <div
        class="relative"
        in:fly={{ x: 50, duration: 800, delay: 300, easing: cubicOut }}
      >
        <div
          class="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 cursor-pointer"
          class:scale-105={isHovering}
          onmouseenter={() => (isHovering = true)}
          onmouseleave={() => (isHovering = false)}
          in:fly={{ y: 0, duration: 800, delay: 500, easing: cubicOut }}
        >
          <img
            src="/woman-flower-crown.png"
            alt="Mental health and wellness - woman with flowers"
            class="w-full h-auto object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t to-transparent"
            style="background: linear-gradient(to top, oklch(0.4 0.0812 92.8 / 0.4), transparent);"
          ></div>

          <!-- Floating badge -->
          <div
            class="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
            in:fly={{ y: 20, duration: 600, delay: 1000, easing: cubicOut }}
          >
            <p
              class="text-sm font-kollektif font-semibold"
              style="color: var(--primary);"
            >
              ✨ Join 500+ organizations transforming workplace mental health
            </p>
          </div>
        </div>

        <!-- Decorative elements -->
        <div
          class="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-xl"
          style="background-color: var(--primary); opacity: 0.15;"
          in:fade={{ duration: 600, delay: 800 }}
        ></div>
        <div
          class="absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-xl"
          style="background-color: var(--secondary); opacity: 0.15;"
          in:fade={{ duration: 600, delay: 900 }}
        ></div>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes gradient {
    0%,
    100% {
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
