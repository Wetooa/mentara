<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import AnimateOnScroll from "$lib/components/AnimateOnScroll.svelte";
  import FeatureShowcase from "$lib/components/FeatureShowcase.svelte";
  import ParallaxDots from "$lib/components/ParallaxDots.svelte";
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
    <section class="py-20 md:py-32 relative bg-white">
      <ParallaxDots variant="white" />
      <div class="absolute inset-0 -z-10">
        <div
          class="absolute inset-0 bg-gradient-to-br from-white via-[oklch(0.98_0.0464_124.31)]/10 to-white"
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
              <p
                class="text-xl text-muted-foreground font-kollektif leading-relaxed"
              >
                Mentara is a comprehensive mental health platform designed to
                provide accessible, data-driven mental health support for
                individuals and organizations.
              </p>
            </div>
          {/snippet}
        </AnimateOnScroll>
      </div>
    </section>

    <!-- Enterprise Features Section -->
    <section
      class="py-20 relative"
      style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.15) 0%, oklch(0.98 0.0464 124.31 / 0.05) 100%);"
    >
      <ParallaxDots variant="green" />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll x={-40} duration={800}>
            {#snippet children()}
              <div class="relative rounded-2xl shadow-2xl">
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

    <!-- Security & Compliance -->
    <section class="py-20 relative bg-white">
      <ParallaxDots variant="white" />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll x={40} duration={800}>
            {#snippet children()}
              <div class="lg:order-2">
                <div
                  class="inline-block px-3 py-1 rounded-full mb-4"
                  style="background-color: oklch(0.98 0.0464 124.31);"
                >
                  <span
                    class="text-xs font-semibold font-kollektif"
                    style="color: var(--primary);">Security First</span
                  >
                </div>
                <h2
                  class="text-3xl md:text-4xl font-bold font-futura mb-6"
                  style="color: var(--primary);"
                >
                  HIPAA-Compliant Security
                </h2>
                <p
                  class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                >
                  Your data security and privacy are paramount. Mentara
                  implements <strong>end-to-end encryption</strong>, secure JWT
                  authentication with bcrypt hashing, and HIPAA compliance
                  considerations for all health data.
                </p>
                <ul class="space-y-4">
                  <li class="flex items-start">
                    <span class="text-xl mr-3">🔒</span>
                    <div>
                      <div
                        class="font-semibold mb-1"
                        style="color: var(--primary);"
                      >
                        End-to-End Encryption
                      </div>
                      <div class="text-sm text-muted-foreground">
                        All sensitive data encrypted in transit and at rest
                        using AES-256
                      </div>
                    </div>
                  </li>
                  <li class="flex items-start">
                    <span class="text-xl mr-3">🛡️</span>
                    <div>
                      <div
                        class="font-semibold mb-1"
                        style="color: var(--primary);"
                      >
                        Role-Based Access Control
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Comprehensive RBAC with granular permissions for
                        clients, therapists, moderators, and admins
                      </div>
                    </div>
                  </li>
                  <li class="flex items-start">
                    <span class="text-xl mr-3">🔐</span>
                    <div>
                      <div
                        class="font-semibold mb-1"
                        style="color: var(--primary);"
                      >
                        Secure Authentication
                      </div>
                      <div class="text-sm text-muted-foreground">
                        JWT-based authentication with bcrypt password hashing
                        and session management
                      </div>
                    </div>
                  </li>
                  <li class="flex items-start">
                    <span class="text-xl mr-3">📋</span>
                    <div>
                      <div
                        class="font-semibold mb-1"
                        style="color: var(--primary);"
                      >
                        Audit Logging
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Comprehensive audit trails for all critical operations
                        and data access
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <AnimateOnScroll x={-40} duration={800}>
            {#snippet children()}
              <div class="lg:order-1 relative rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop"
                  alt="Security and data protection"
                  class="w-full h-auto object-cover"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[oklch(0.56_0.1223_127.47)]/40 to-[oklch(0.4_0.0812_92.8)]/40"
                ></div>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- Platform Features -->
    <section
      class="py-20 relative"
      style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.15) 0%, oklch(0.98 0.0464 124.31 / 0.08) 100%);"
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
                Platform Features
              </h2>
              <p
                class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto"
              >
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
                <h3
                  class="text-xl font-bold font-futura mb-2"
                  style="color: var(--primary);"
                >
                  Community Support
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Connect with others in safe, moderated community spaces for
                  shared experiences and peer support.
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
                <h3
                  class="text-xl font-bold font-futura mb-2"
                  style="color: var(--primary);"
                >
                  Licensed Therapists
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Book sessions with 100+ licensed mental health professionals
                  available 24/7.
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
                <h3
                  class="text-xl font-bold font-futura mb-2"
                  style="color: var(--primary);"
                >
                  Video Sessions
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Secure, HIPAA-compliant video calling with real-time
                  communication and recording capabilities.
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
                <h3
                  class="text-xl font-bold font-futura mb-2"
                  style="color: var(--primary);"
                >
                  AI-Powered Assessments
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Comprehensive pre-assessment questionnaires with AI evaluation
                  for personalized care planning.
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
                <h3
                  class="text-xl font-bold font-futura mb-2"
                  style="color: var(--primary);"
                >
                  Secure Messaging
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Real-time encrypted messaging between clients and therapists
                  with file sharing support.
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
                <h3
                  class="text-xl font-bold font-futura mb-2"
                  style="color: var(--primary);"
                >
                  Analytics & Insights
                </h3>
                <p class="text-sm text-muted-foreground font-kollektif">
                  Data-driven dashboards with engagement metrics, session
                  analytics, and mental health trends.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- Real-time Features -->
    <section class="py-20 relative bg-white">
      <ParallaxDots variant="white" />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll x={-40} duration={800}>
            {#snippet children()}
              <div>
                <div
                  class="inline-block px-3 py-1 rounded-full mb-4"
                  style="background-color: oklch(0.98 0.0464 124.31);"
                >
                  <span
                    class="text-xs font-semibold font-kollektif"
                    style="color: var(--primary);">Real-Time Technology</span
                  >
                </div>
                <h2
                  class="text-3xl md:text-4xl font-bold font-futura mb-6"
                  style="color: var(--primary);"
                >
                  Instant Communication
                </h2>
                <p
                  class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                >
                  Powered by <strong>Socket.io WebSockets</strong> and
                  <strong>WebRTC</strong>, Mentara delivers seamless real-time
                  communication. Our infrastructure supports high-definition
                  video consultations with sub-50ms latency for messaging.
                </p>
                <div class="space-y-4">
                  <div class="flex items-start">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
                      style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                    >
                      <span class="text-white text-lg">⚡</span>
                    </div>
                    <div>
                      <div
                        class="font-semibold mb-1"
                        style="color: var(--primary);"
                      >
                        Socket.io Integration
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Real-time bidirectional event-based communication with
                        automatic reconnection and fallback support
                      </div>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
                      style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                    >
                      <span class="text-white text-lg">📹</span>
                    </div>
                    <div>
                      <div
                        class="font-semibold mb-1"
                        style="color: var(--primary);"
                      >
                        WebRTC Video Sessions
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Peer-to-peer encrypted video with screen sharing and
                        session recording capabilities
                      </div>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
                      style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
                    >
                      <span class="text-white text-lg">🔔</span>
                    </div>
                    <div>
                      <div
                        class="font-semibold mb-1"
                        style="color: var(--primary);"
                      >
                        Push Notifications
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Real-time notifications with typing indicators, read
                        receipts, and presence detection
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <AnimateOnScroll x={40} duration={800}>
            {#snippet children()}
              <div class="relative rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop"
                  alt="Real-time communication and connectivity"
                  class="w-full h-auto object-cover"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                ></div>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- Technical Stack -->
    <section
      class="py-20 relative"
      style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.12) 0%, oklch(0.98 0.0464 124.31 / 0.15) 100%);"
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
                Built with Modern Technology
              </h2>
              <p
                class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto"
              >
                Enterprise-grade platform built for scale, security, and
                reliability
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
                  Frontend Architecture
                </h3>
                <ul class="space-y-3 font-kollektif text-muted-foreground">
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>Next.js 15.2.4</strong> - React framework with app
                      router and server components</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>TypeScript</strong> - Strict mode for type-safe development</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>TailwindCSS 4.x</strong> - Custom OKLCH color system
                      with utility-first styling</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>shadcn/ui</strong> - Radix UI primitives with full
                      accessibility</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>Zustand + React Query v5</strong> - Client and server
                      state management</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>React Hook Form</strong> - Performant form validation</span
                    >
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
                  Backend Infrastructure
                </h3>
                <ul class="space-y-3 font-kollektif text-muted-foreground">
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>NestJS 11.x</strong> - Enterprise-grade Node.js framework
                      with dependency injection</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>PostgreSQL via Supabase</strong> - Scalable database
                      with Prisma ORM for type-safe queries</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>Socket.io + WebRTC</strong> - Real-time messaging
                      and HD video consultations</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>JWT + Bcrypt</strong> - Secure token-based auth with
                      password hashing</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>Stripe API</strong> - Integrated payment processing
                      with webhook handling</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>Python Flask + PyTorch</strong> - ML service for AI-powered
                      patient evaluation</span
                    >
                  </li>
                  <li class="flex items-start">
                    <span class="mr-2" style="color: var(--primary);">✓</span>
                    <span
                      ><strong>Redis Caching</strong> - Session management and performance
                      optimization</span
                    >
                  </li>
                </ul>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>

        <!-- Infrastructure Image -->
        <AnimateOnScroll y={50} duration={800}>
          {#snippet children()}
            <div class="mt-16 relative rounded-2xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop"
                alt="Cloud infrastructure and technology"
                class="w-full h-64 object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-[oklch(0.56_0.1223_127.47)]/80 to-[oklch(0.4_0.0812_92.8)]/80"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white px-6">
                  <h3 class="text-3xl font-bold font-futura mb-3">
                    Microservices Architecture
                  </h3>
                  <p class="text-lg font-kollektif max-w-2xl">
                    Three independently deployable services working in harmony -
                    scalable, maintainable, and production-ready
                  </p>
                </div>
              </div>
            </div>
          {/snippet}
        </AnimateOnScroll>
      </div>
    </section>

    <!-- AI & Machine Learning -->
    <section
      class="py-20 relative"
      style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.15) 0%, oklch(0.98 0.0464 124.31 / 0.1) 100%);"
    >
      <ParallaxDots variant="green" />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll x={40} duration={800}>
            {#snippet children()}
              <div class="lg:order-2">
                <div
                  class="inline-block px-3 py-1 rounded-full mb-4"
                  style="background-color: oklch(0.98 0.0464 124.31);"
                >
                  <span
                    class="text-xs font-semibold font-kollektif"
                    style="color: var(--primary);">Artificial Intelligence</span
                  >
                </div>
                <h2
                  class="text-3xl md:text-4xl font-bold font-futura mb-6"
                  style="color: var(--primary);"
                >
                  AI-Powered Mental Health Insights
                </h2>
                <p
                  class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                >
                  Our dedicated <strong>Python ML microservice</strong> uses
                  <strong>PyTorch neural networks</strong> to analyze comprehensive
                  mental health assessments. The AI evaluates patient responses,
                  identifies patterns, and provides therapists with actionable insights
                  for personalized treatment planning.
                </p>
                <div class="space-y-4">
                  <div
                    class="p-4 rounded-xl border"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <div
                      class="font-semibold mb-2"
                      style="color: var(--primary);"
                    >
                      📊 Natural Language Processing
                    </div>
                    <div class="text-sm text-muted-foreground">
                      Sentiment analysis and keyword extraction from assessment
                      responses
                    </div>
                  </div>
                  <div
                    class="p-4 rounded-xl border"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <div
                      class="font-semibold mb-2"
                      style="color: var(--primary);"
                    >
                      🎯 Risk Assessment
                    </div>
                    <div class="text-sm text-muted-foreground">
                      ML models trained to identify mental health risk factors
                      and severity levels
                    </div>
                  </div>
                  <div
                    class="p-4 rounded-xl border"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <div
                      class="font-semibold mb-2"
                      style="color: var(--primary);"
                    >
                      🤖 Personalized Recommendations
                    </div>
                    <div class="text-sm text-muted-foreground">
                      AI-driven therapist matching based on patient needs and
                      therapist specializations
                    </div>
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <AnimateOnScroll x={-40} duration={800}>
            {#snippet children()}
              <div class="lg:order-1 relative rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop"
                  alt="AI and machine learning technology"
                  class="w-full h-auto object-cover"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[oklch(0.56_0.1223_127.47)]/30 to-[oklch(0.4_0.0812_92.8)]/30"
                ></div>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- Key Features -->
    <section class="py-20 relative bg-white">
      <ParallaxDots variant="white" />
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
                  <svg
                    class="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    class="text-lg font-bold font-futura mb-2"
                    style="color: var(--primary);"
                  >
                    Real-Time Messaging
                  </h3>
                  <p class="text-sm text-muted-foreground font-kollektif">
                    Instant, encrypted communication between clients and
                    therapists with typing indicators, read receipts, and file
                    sharing.
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
                  <svg
                    class="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    class="text-lg font-bold font-futura mb-2"
                    style="color: var(--primary);"
                  >
                    Smart Booking
                  </h3>
                  <p class="text-sm text-muted-foreground font-kollektif">
                    Intelligent scheduling system with availability management,
                    automated reminders, and payment integration.
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
                  <h3
                    class="text-lg font-bold font-futura mb-2"
                    style="color: var(--primary);"
                  >
                    AI-Powered Insights
                  </h3>
                  <p class="text-sm text-muted-foreground font-kollektif">
                    Machine learning models analyze pre-assessment data to
                    provide therapists with actionable patient insights.
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
                  <svg
                    class="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    class="text-lg font-bold font-futura mb-2"
                    style="color: var(--primary);"
                  >
                    Role-Based Access Control
                  </h3>
                  <p class="text-sm text-muted-foreground font-kollektif">
                    Comprehensive permission system supporting clients,
                    therapists, moderators, and administrators.
                  </p>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- App Screenshots Showcase -->
    <section class="py-20 relative bg-white">
      <ParallaxDots variant="white" />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll y={30} duration={600}>
          {#snippet children()}
            <div class="text-center mb-16">
              <h2
                class="text-3xl md:text-5xl font-bold font-futura mb-4"
                style="color: var(--primary);"
              >
                Explore the Platform
              </h2>
              <p
                class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto"
              >
                A complete mental health ecosystem in one seamless application
              </p>
            </div>
          {/snippet}
        </AnimateOnScroll>

        <div class="space-y-24">
          <!-- Screenshot 1: Client Dashboard -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-1">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">Client Portal</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Personalized Dashboard
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    A comprehensive view of your mental health journey. Track
                    appointments, view upcoming sessions, access resources, and
                    monitor your progress all in one place.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Quick access to upcoming therapy sessions</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Mental health resources and worksheets</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Community engagement overview</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-2">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/client-dashboard.png"
                      alt="Client Dashboard"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Screenshot 2: Find Therapists -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-2">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">Therapist Discovery</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Find Your Perfect Match
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    Browse through 100+ licensed therapists with detailed
                    profiles, specializations, ratings, and availability. Filter
                    by expertise, language, and approach to find the right fit
                    for you.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Detailed therapist profiles with credentials</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Filter by specialization and availability</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Read reviews and ratings from other clients</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-1">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/client-therapists.png"
                      alt="Find Therapists"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Screenshot 3: Booking Sessions -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-1">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">Session Management</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Easy Appointment Booking
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    Schedule, manage, and track all your therapy sessions in one
                    place. View upcoming appointments, session history, and
                    receive automated reminders.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Real-time availability calendar</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Automated email and SMS reminders</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Integrated payment processing</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-2">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/client-sessions.png"
                      alt="Session Booking"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Screenshot 4: Secure Messaging -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-2">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">Communication</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Secure Messaging
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    Stay connected with your therapist through secure, encrypted
                    messaging. Share files, ask questions between sessions, and
                    maintain continuity in your care.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >End-to-end encrypted conversations</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >File sharing and media support</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Real-time notifications and read receipts</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-1">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/client-messages.png"
                      alt="Secure Messaging"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Screenshot 5: Pre-Assessment -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-1">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">AI Assessment</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Intelligent Pre-Assessment
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    Complete comprehensive mental health assessments powered by
                    AI. Get personalized insights and match with the right
                    therapist based on your unique needs and concerns.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Validated psychological assessment tools</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >AI-powered analysis and recommendations</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Progress tracking over time</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-2">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/preassessment-forms.png"
                      alt="Pre-Assessment Forms"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Screenshot 6: Worksheets -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-2">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">Resources</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Interactive Worksheets
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    Access a library of therapeutic worksheets, exercises, and
                    resources. Work on assignments between sessions and track
                    your personal growth.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Curated mental health resources</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Progress tracking and completion status</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Share results with your therapist</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-1">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/client-worksheets.png"
                      alt="Interactive Worksheets"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Screenshot 7: Therapist Dashboard -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-1">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">Therapist Tools</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Therapist Dashboard
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    Comprehensive practice management tools for therapists.
                    Manage clients, schedule sessions, track earnings, and
                    access patient assessments all in one platform.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Client management and session history</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Revenue tracking and analytics</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >AI-powered patient insights</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-2">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/therapist-dashboard.png"
                      alt="Therapist Dashboard"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Screenshot 8: Scheduling -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-2">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">Availability</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Smart Scheduling
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    Therapists can easily manage their availability with our
                    intuitive calendar system. Set recurring schedules, block
                    time off, and handle bookings effortlessly.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Flexible availability management</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Automatic conflict detection</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >One-click booking confirmation</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-1">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/therapist-scheduling.png"
                      alt="Therapist Scheduling"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Screenshot 9: Client Profile -->
          <AnimateOnScroll y={50} duration={800}>
            {#snippet children()}
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="lg:order-1">
                  <div
                    class="inline-block px-3 py-1 rounded-full mb-4"
                    style="background-color: oklch(0.98 0.0464 124.31);"
                  >
                    <span
                      class="text-xs font-semibold font-kollektif"
                      style="color: var(--primary);">User Management</span
                    >
                  </div>
                  <h3
                    class="text-3xl md:text-4xl font-bold font-futura mb-4"
                    style="color: var(--primary);"
                  >
                    Comprehensive Profiles
                  </h3>
                  <p
                    class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6"
                  >
                    Complete profile management with personal information,
                    preferences, and mental health history. Keep your
                    information secure and up-to-date.
                  </p>
                  <ul class="space-y-3">
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Secure data storage and privacy controls</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Customizable preferences and settings</span
                      >
                    </li>
                    <li class="flex items-start">
                      <span class="mr-2 mt-1" style="color: var(--primary);"
                        >✓</span
                      >
                      <span class="text-muted-foreground font-kollektif"
                        >Mental health history tracking</span
                      >
                    </li>
                  </ul>
                </div>
                <div class="lg:order-2">
                  <div
                    class="relative rounded-2xl shadow-2xl border-2"
                    style="border-color: var(--primary); border-opacity: 0.2;"
                  >
                    <img
                      src="/app-screenshots/client-profile.png"
                      alt="Client Profile"
                      class="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            {/snippet}
          </AnimateOnScroll>
        </div>
      </div>
    </section>

    <!-- Team Section -->
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
                <div class="relative mb-6 rounded-2xl">
                  <img
                    src="/team/tolentino.jpg"
                    alt="Team Member"
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
                  Leading strategic partnerships and business development to
                  expand Mentara's reach and impact in mental health care.
                </p>
              </div>
            {/snippet}
          </AnimateOnScroll>

          <!-- Team Member 2 -->
          <AnimateOnScroll y={40} duration={600} delay={200}>
            {#snippet children()}
              <div class="text-center group">
                <div class="relative mb-6 rounded-2xl">
                  <img
                    src="/team/sajulga.jpg"
                    alt="Team Member"
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
                <div class="relative mb-6 rounded-2xl">
                  <img
                    src="/team/segundo.jpg"
                    alt="Team Member"
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

    <!-- CTA Section -->
    <section
      class="py-20 relative"
      style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.12) 0%, oklch(0.98 0.0464 124.31 / 0.18) 100%);"
    >
      <ParallaxDots variant="green" />
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
