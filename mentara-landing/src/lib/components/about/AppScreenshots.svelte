<script lang="ts">
  import AnimateOnScroll from "../AnimateOnScroll.svelte";
  import ParallaxDots from "../ParallaxDots.svelte";
  import FeatureShowcase from "../FeatureShowcase.svelte";
</script>

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
      <FeatureShowcase
        badge="Smart Matching"
        title="AI-Powered Matching"
        description="Our intelligent system pairs clients with therapists who best fit their needs and personality. Using advanced algorithms, we analyze preferences, specializations, and therapeutic approaches to ensure the perfect match."
        features={[
          "Personalized therapist recommendations",
          "Compatibility scoring based on needs",
          "Continuous learning for better matches",
        ]}
        imageSrcs={[
          "/app-screenshots/matching-therapists.png",
          "/app-screenshots/matching-communities.png",
        ]}
        imageAlts={[
          "AI-Powered Therapist Matching",
          "AI-Powered Community Matching",
        ]}
        imagePosition="right"
      />

      <FeatureShowcase
        badge="Scheduling"
        title="Availability-Based Booking"
        description="Simplifies scheduling for both clients and professionals. Therapists can easily set their availability, and clients can book sessions that fit their schedule seamlessly."
        features={[
          "Real-time availability management",
          "Flexible scheduling options",
          "Automated booking confirmations",
        ]}
        imageSrc="/app-screenshots/therapist-availability.png"
        imageAlt="Availability-Based Booking"
        imagePosition="left"
      />

      <FeatureShowcase
        badge="Community"
        title="Moderated Community Support Space"
        description="Provides a safe zone for shared healing and peer encouragement. Connect with others on similar journeys in a professionally moderated environment that prioritizes respect and support."
        features={[
          "Safe and moderated discussions",
          "Peer support and encouragement",
          "Community-driven healing",
        ]}
        imageSrc="/app-screenshots/client-community.png"
        imageAlt="Community Support Space"
        imagePosition="right"
      />

      <FeatureShowcase
        badge="Assessment"
        title="Standardized Pre-Assessment Tools"
        description="Help therapists understand clients before the first session. Our validated assessment tools provide comprehensive insights into mental health needs, concerns, and goals."
        features={[
          "Validated psychological assessments",
          "Comprehensive mental health screening",
          "Results shared with your therapist",
        ]}
        imageSrcs={[
          "/app-screenshots/preassessment-checklist.png",
          "/app-screenshots/preassessment-form.png",
        ]}
        imageAlts={["Pre-Assessment Checklist", "Pre-Assessment Form"]}
        imagePosition="left"
      />

      <FeatureShowcase
        badge="Therapist Tools"
        title="Digital Tools for Therapists"
        description="Including optional therapy worksheets and progress tracking for clients between sessions. Comprehensive practice management tools that streamline client care and administrative tasks."
        features={[
          "Client management dashboard",
          "Therapy worksheets library",
          "Progress tracking and insights",
        ]}
        imageSrcs={[
          "/app-screenshots/therapist-worksheet.png",
          "/app-screenshots/therapist-dashboard.png",
          "/app-screenshots/therapist-clients.png",
        ]}
        imageAlts={[
          "Therapy Worksheets",
          "Therapist Dashboard",
          "Client Management",
        ]}
        imagePosition="right"
      />

      <FeatureShowcase
        badge="Wellness Programs"
        title="Guided Group Programs and Webinars"
        description="Focused on stress, resilience, and mental wellness education. Join expert-led sessions designed to build coping skills, foster community, and promote long-term mental health."
        features={[
          "Expert-led group sessions",
          "Stress management workshops",
          "Resilience building programs",
        ]}
        imageSrc="/app-screenshots/client-community-sessions.png"
        imageAlt="Group Programs and Webinars"
        imagePosition="left"
      />
    </div>
  </div>
</section>
