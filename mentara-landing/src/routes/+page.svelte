<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Hero from '$lib/components/Hero.svelte';
</script>

<svelte:head>
  <title>Mentara - Empowering Minds, Transforming Lives</title>
  <meta name="description" content="Mentara provides data-driven mental health solutions with 24/7 access to licensed therapists and comprehensive mental health resources." />
</svelte:head>

<div class="min-h-screen bg-background">
  <Navbar />
  
  <main>
    <Hero />

    <!-- Features Section -->
    <section class="py-20 bg-muted/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold font-futura mb-4" style="color: var(--primary);">
            Our Approach
          </h2>
          <p class="text-xl text-muted-foreground font-kollektif max-w-2xl mx-auto">
            A comprehensive mental health solution tailored to your needs
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="p-8 rounded-2xl bg-white border border-border hover:shadow-xl transition-all">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6" style="background-color: var(--community-calm);">
              <svg class="w-8 h-8" style="color: var(--community-calm-foreground);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-xl font-bold font-futura mb-3" style="color: var(--primary);">
              Education & Awareness
            </h3>
            <p class="text-muted-foreground font-kollektif">
              Reducing stigma and normalizing mental health through comprehensive resources and tools for personal development.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="p-8 rounded-2xl bg-white border border-border hover:shadow-xl transition-all">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6" style="background-color: var(--community-warm);">
              <svg class="w-8 h-8" style="color: var(--community-warm-foreground);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold font-futura mb-3" style="color: var(--primary);">
              Diagnostic Approach
            </h3>
            <p class="text-muted-foreground font-kollektif">
              Make better business decisions with insights from qualitative and quantitative mental health data.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="p-8 rounded-2xl bg-white border border-border hover:shadow-xl transition-all">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6" style="background-color: var(--community-soothing);">
              <svg class="w-8 h-8" style="color: var(--community-soothing-foreground);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold font-futura mb-3" style="color: var(--primary);">
              Convenient Access
            </h3>
            <p class="text-muted-foreground font-kollektif">
              24/7 access to mental health resources, talk therapy scheduling, and coaching in one seamless ecosystem.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-5xl font-bold font-futura mb-6" style="color: var(--primary);">
          Ready to Transform Your Organization?
        </h2>
        <p class="text-xl text-muted-foreground font-kollektif mb-8">
          Book a demo to see how Mentara can help create a mentally healthy workplace
        </p>
        <a
          href="/demo"
          class="inline-block px-10 py-4 rounded-lg text-xl font-semibold font-kollektif transition-all hover:shadow-xl hover:scale-105"
          style="background-color: var(--primary); color: var(--primary-foreground);"
        >
          Book a Demo
        </a>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="py-12 border-t border-border bg-muted/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <div class="text-2xl font-bold font-futura mb-4" style="color: var(--primary);">
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
