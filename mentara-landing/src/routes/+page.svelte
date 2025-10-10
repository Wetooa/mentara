<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import { Motion } from 'svelte-motion';
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
    <section class="py-20 bg-gradient-to-b from-white to-emerald-50/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Motion
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          let:motion
        >
          <div use:motion class="text-center mb-16">
            <Motion
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              let:motion
            >
              <div use:motion class="inline-block px-4 py-2 bg-emerald-100 rounded-full mb-4">
                <span class="text-emerald-700 font-semibold font-kollektif text-sm">Why Choose Mentara</span>
              </div>
            </Motion>
            <Motion
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              let:motion
            >
              <h2 use:motion class="text-4xl md:text-5xl font-bold font-futura mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Our Approach
              </h2>
            </Motion>
            <Motion
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              let:motion
            >
              <p use:motion class="text-xl text-muted-foreground font-kollektif max-w-2xl mx-auto">
                A comprehensive mental health solution tailored to your needs
              </p>
            </Motion>
          </div>
        </Motion>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <Motion
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            let:motion
          >
            <div use:motion class="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-2xl transition-all">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold font-futura mb-3 text-cyan-900">
              Education & Awareness
            </h3>
            <p class="text-cyan-800 font-kollektif leading-relaxed">
              Reducing stigma and normalizing mental health through comprehensive resources and tools for personal development.
            </p>
            </div>
          </Motion>

          <!-- Feature 2 -->
          <Motion
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            let:motion
          >
            <div use:motion class="group p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold font-futura mb-3 text-emerald-900">
              Diagnostic Approach
            </h3>
            <p class="text-emerald-800 font-kollektif leading-relaxed">
              Make better business decisions with insights from qualitative and quantitative mental health data.
            </p>
            </div>
          </Motion>

          <!-- Feature 3 -->
          <Motion
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            let:motion
          >
            <div use:motion class="group p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 hover:border-violet-400 hover:shadow-2xl transition-all">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold font-futura mb-3 text-violet-900">
              Convenient Access
            </h3>
            <p class="text-violet-800 font-kollektif leading-relaxed">
              24/7 access to mental health resources, talk therapy scheduling, and coaching in one seamless ecosystem.
            </p>
            </div>
          </Motion>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <Motion
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        let:motion
      >
        <div use:motion class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            let:motion
          >
            <h2 use:motion class="text-3xl md:text-5xl font-bold font-futura mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Ready to Transform Your Organization?
            </h2>
          </Motion>
          <Motion
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            let:motion
          >
            <p use:motion class="text-xl text-muted-foreground font-kollektif mb-8">
              Book a demo to see how Mentara can help create a mentally healthy workplace
            </p>
          </Motion>
          <Motion
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            let:motion
          >
            <a
              use:motion
              href="/demo"
              class="inline-block px-10 py-4 rounded-xl text-xl font-semibold font-kollektif transition-all shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            >
              Book a Demo
            </a>
          </Motion>
        </div>
      </Motion>
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
