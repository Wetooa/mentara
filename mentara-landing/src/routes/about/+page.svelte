<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import AnimateOnScroll from "$lib/components/AnimateOnScroll.svelte";
</script>

<svelte:head>
  <title>About Us - Mentara</title>
  <meta
    name="description"
    content="Learn about Mentara's mission, technology, and team dedicated to transforming mental health care."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <Navbar />

  <main>
    <!-- Hero Section -->
    <section class="py-20 md:py-32 relative overflow-hidden">
      <div class="absolute inset-0 -z-10">
        <div
          class="absolute inset-0 bg-gradient-to-br from-[oklch(0.56_0.1223_127.47)]/10 via-white to-[oklch(0.98_0.0464_124.31)]/15"
        ></div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll y={30} duration={800}>
          {#snippet children()}
            <div class="text-center max-w-4xl mx-auto">
              <div
                class="inline-block px-4 py-2 rounded-full mb-6"
                style="background-color: oklch(0.98 0.0464 124.31);"
              >
                <span
                  class="font-semibold font-kollektif text-sm"
                  style="color: var(--primary);">About Mentara</span
                >
              </div>
              <h1
                class="text-4xl md:text-6xl font-bold font-futura mb-6 bg-gradient-to-r bg-clip-text text-transparent"
                style="background-image: linear-gradient(to right, var(--primary), var(--secondary));"
              >
                Transforming Mental Health Care with Technology
              </h1>
              <p class="text-xl text-muted-foreground font-kollektif leading-relaxed">
                Mentara is a comprehensive mental health platform designed to provide
                accessible, data-driven mental health support for individuals and organizations.
              </p>
            </div>
          {/snippet}
        </AnimateOnScroll>
      </div>
    </section>

    <!-- Platform Features -->
    <section class="py-20 bg-gradient-to-b from-white via-[oklch(0.98_0.0464_124.31)]/5 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll y={30} duration={600}>
          {#snippet children()}
            <div class="text-center mb-16">
              <h2
                class="text-3xl md:text-5xl font-bold font-futura mb-4"
                style="color: var(--primary);"
              >
                Platform Features
              </h2>
              <p class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto">
                Everything you need for comprehensive mental health care
              </p>
            </div>
          {/snippet}
        </AnimateOnScroll>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Feature 1: Community Support -->
          <AnimateOnScroll y={40} duration={600} delay={100}>
            {#snippet children()}
              <div
                class="p-6 rounded-2xl border-2 bg-white hover:shadow-lg transition-all"
                style="border-color: var(--primary); border-opacity: 0.2;"
              >
                <img
                  src="/icons/community.svg"
                  alt="Community"
                  class="w-12 h-12 mb-4"
                  style="filter: sepia(1) saturate(5) hue-rotate(70deg);"
                />
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  Community Support
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Connect with others in safe, moderated community spaces for shared experiences and peer support.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Feature 2: Therapist Sessions -->
          <AnimateOnScroll y={40} duration={600} delay={200}>
            {#snippet children()}
              <div
                class="p-6 rounded-2xl border-2 bg-white hover:shadow-lg transition-all"
                style="border-color: var(--primary); border-opacity: 0.2;"
              >
                <img
                  src="/icons/therapist.svg"
                  alt="Therapist"
                  class="w-12 h-12 mb-4"
                  style="filter: sepia(1) saturate(5) hue-rotate(70deg);"
                />
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  Licensed Therapists
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Book sessions with 100+ licensed mental health professionals available 24/7.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Feature 3: Video Sessions -->
          <AnimateOnScroll y={40} duration={600} delay={300}>
            {#snippet children()}
              <div
                class="p-6 rounded-2xl border-2 bg-white hover:shadow-lg transition-all"
                style="border-color: var(--primary); border-opacity: 0.2;"
              >
                <img
                  src="/icons/sessions.svg"
                  alt="Sessions"
                  class="w-12 h-12 mb-4"
                  style="filter: sepia(1) saturate(5) hue-rotate(70deg);"
                />
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  Video Sessions
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Secure, HIPAA-compliant video calling with real-time communication and recording capabilities.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Feature 4: Pre-Assessments -->
          <AnimateOnScroll y={40} duration={600} delay={100}>
            {#snippet children()}
              <div
                class="p-6 rounded-2xl border-2 bg-white hover:shadow-lg transition-all"
                style="border-color: var(--primary); border-opacity: 0.2;"
              >
                <img
                  src="/icons/worksheets.svg"
                  alt="Worksheets"
                  class="w-12 h-12 mb-4"
                  style="filter: sepia(1) saturate(5) hue-rotate(70deg);"
                />
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  AI-Powered Assessments
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Comprehensive pre-assessment questionnaires with AI evaluation for personalized care planning.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Feature 5: Messaging -->
          <AnimateOnScroll y={40} duration={600} delay={200}>
            {#snippet children()}
              <div
                class="p-6 rounded-2xl border-2 bg-white hover:shadow-lg transition-all"
                style="border-color: var(--primary); border-opacity: 0.2;"
              >
                <img
                  src="/icons/messages.svg"
                  alt="Messages"
                  class="w-12 h-12 mb-4"
                  style="filter: sepia(1) saturate(5) hue-rotate(70deg);"
                />
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  Secure Messaging
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Real-time encrypted messaging between clients and therapists with file sharing support.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Feature 6: Analytics -->
          <AnimateOnScroll y={40} duration={600} delay={300}>
            {#snippet children()}
              <div
                class="p-6 rounded-2xl border-2 bg-white hover:shadow-lg transition-all"
                style="border-color: var(--primary); border-opacity: 0.2;"
              >
                <img
                  src="/icons/dashboard.svg"
                  alt="Dashboard"
                  class="w-12 h-12 mb-4"
                  style="filter: sepia(1) saturate(5) hue-rotate(70deg);"
                />
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  Analytics & Insights
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Data-driven dashboards with engagement metrics, session analytics, and mental health trends.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- Technical Stack -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll y={30} duration={600}>
          {#snippet children()}
            <div class="text-center mb-16">
              <h2
                class="text-3xl md:text-5xl font-bold font-futura mb-4"
                style="color: var(--primary);"
              >
                Built with Modern Technology
              </h2>
              <p class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto">
                Enterprise-grade platform built for scale, security, and reliability
              </p>
            </div>
          {/snippet}
        </AnimateOnScroll>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Frontend -->
          <AnimateOnScroll x={-40} duration={800}>
            {#snippet children()}
              <div>
                <h3
                  class="text-2xl font-bold font-futura mb-6 flex items-center"
                  style="color: var(--primary);"
                >
                  <span
                    class="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                    style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                  >
                    <span class="text-white text-xl">🎨</span>
                  </span>
                  Frontend
                </h3>
                <ul class="space-y-3 font-kollektif text-muted-foreground">
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>Next.js 14</strong> - React framework with app router</span>
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>TypeScript</strong> - Type-safe development</span>
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>TailwindCSS</strong> - Utility-first styling with custom design system</span>
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>shadcn/ui</strong> - Accessible component library</span>
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>Zustand</strong> - State management</span>
                  </li>
                </ul>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Backend -->
          <AnimateOnScroll x={40} duration={800}>
            {#snippet children()}
              <div>
                <h3
                  class="text-2xl font-bold font-futura mb-6 flex items-center"
                  style="color: var(--primary);"
                >
                  <span
                    class="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                    style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                  >
                    <span class="text-white text-xl">⚡</span>
                  </span>
                  Backend
                </h3>
                <ul class="space-y-3 font-kollektif text-muted-foreground">
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>NestJS</strong> - Enterprise Node.js framework</span>
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>PostgreSQL</strong> - Relational database with Prisma ORM</span>
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>Socket.io</strong> - Real-time communication</span>
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>JWT & Bcrypt</strong> - Secure authentication</span>
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span><strong>Python ML API</strong> - AI-powered patient evaluation</span>
                  </li>
                </ul>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- Key Features -->
    <section class="py-20 bg-gradient-to-b from-white via-[oklch(0.98_0.0464_124.31)]/10 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll y={30} duration={600}>
          {#snippet children()}
            <div class="text-center mb-16">
              <h2
                class="text-3xl md:text-5xl font-bold font-futura mb-4"
                style="color: var(--primary);"
              >
                What Makes Us Different
              </h2>
            </div>
          {/snippet}
        </AnimateOnScroll>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Real-time Communication -->
          <AnimateOnScroll y={40} duration={600} delay={100}>
            {#snippet children()}
              <div class="flex items-start space-x-4">
                <div
                  class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                >
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold font-futura mb-2" style="color: var(--primary);">
                    Real-Time Messaging
                  </h3>
                  <p class="text-sm text-muted-foreground font-kollektif">
                    Instant, encrypted communication between clients and therapists with typing indicators, read receipts, and file sharing.
                  </p>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Booking System -->
          <AnimateOnScroll y={40} duration={600} delay={200}>
            {#snippet children()}
              <div class="flex items-start space-x-4">
                <div
                  class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                >
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold font-futura mb-2" style="color: var(--primary);">
                    Smart Booking
                  </h3>
                  <p class="text-sm text-muted-foreground font-kollektif">
                    Intelligent scheduling system with availability management, automated reminders, and payment integration.
                  </p>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- AI Evaluation -->
          <AnimateOnScroll y={40} duration={600} delay={100}>
            {#snippet children()}
              <div class="flex items-start space-x-4">
                <div
                  class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                >
                  <img src="/icons/brain.png" alt="AI" class="w-7 h-7" />
                </div>
                <div>
                  <h3 class="text-lg font-bold font-futura mb-2" style="color: var(--primary);">
                    AI-Powered Insights
                  </h3>
                  <p class="text-sm text-muted-foreground font-kollektif">
                    Machine learning models analyze pre-assessment data to provide therapists with actionable patient insights.
                  </p>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Role-Based Access -->
          <AnimateOnScroll y={40} duration={600} delay={200}>
            {#snippet children()}
              <div class="flex items-start space-x-4">
                <div
                  class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                >
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold font-futura mb-2" style="color: var(--primary);">
                    Role-Based Access Control
                  </h3>
                  <p class="text-sm text-muted-foreground font-kollektif">
                    Comprehensive permission system supporting clients, therapists, moderators, and administrators.
                  </p>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-20">
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
              <p class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto">
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
                    alt="Team Member"
                    class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  Angelo Tolentino
                </h3>
                <p class="text-muted-foreground font-kollektif text-sm mb-3">
                  Co-Founder & Lead Developer
                </p>
                <p class="text-xs text-muted-foreground font-kollektif">
                  Full-stack developer passionate about using technology to improve mental health accessibility.
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
                    alt="Team Member"
                    class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  Kyle Sajulga
                </h3>
                <p class="text-muted-foreground font-kollektif text-sm mb-3">
                  Co-Founder & Backend Architect
                </p>
                <p class="text-xs text-muted-foreground font-kollektif">
                  Backend specialist focused on building scalable, secure infrastructure for mental health services.
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
                    alt="Team Member"
                    class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">
                  Gabriel Segundo
                </h3>
                <p class="text-muted-foreground font-kollektif text-sm mb-3">
                  Co-Founder & AI Engineer
                </p>
                <p class="text-xs text-muted-foreground font-kollektif">
                  Machine learning expert developing AI-powered assessment and evaluation systems.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-br from-[oklch(0.56_0.1223_127.47)]/5 to-[oklch(0.98_0.0464_124.31)]/10">
      <AnimateOnScroll y={30} duration={800}>
        {#snippet children()}
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              class="text-3xl md:text-5xl font-bold font-futura mb-6"
              style="color: var(--primary);"
            >
              Ready to Get Started?
            </h2>
            <p class="text-xl text-muted-foreground font-kollektif mb-8">
              Transform your organization's approach to mental health
            </p>
            <a
              href="/demo"
              class="inline-block px-10 py-4 rounded-xl text-lg font-semibold font-kollektif transition-all hover:shadow-2xl hover:scale-105 text-white"
              style="background: linear-gradient(to right, var(--primary), var(--secondary));"
            >
              Book a Demo
            </a>
          </div>
        {/snippet}
      </AnimateOnScroll>
    </section>
  </main>

  <Footer />
</div>

