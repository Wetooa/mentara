<script lang="ts">
  import AnimateOnScroll from "../AnimateOnScroll.svelte";
  import ParallaxDots from "../ParallaxDots.svelte";
</script>

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
              Your data security and privacy are paramount. Mentara implements <strong
                >end-to-end encryption</strong
              >, secure JWT authentication with bcrypt hashing, and HIPAA
              compliance considerations for all health data.
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
                    All sensitive data encrypted in transit and at rest using
                    AES-256
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
                    Comprehensive RBAC with granular permissions for clients,
                    therapists, moderators, and admins
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
                    JWT-based authentication with bcrypt password hashing and
                    session management
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
                    Comprehensive audit trails for all critical operations and
                    data access
                  </div>
                </div>
              </li>
            </ul>
          </div>
        {/snippet}
      </AnimateOnScroll>

      <AnimateOnScroll x={-40} duration={800}>
        {#snippet children()}
          <div
            class="lg:order-1 relative rounded-2xl shadow-2xl overflow-hidden"
          >
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
