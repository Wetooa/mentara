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
        badge="Client Portal"
        title="Personalized Dashboard"
        description="A comprehensive view of your mental health journey. Track appointments, view upcoming sessions, access resources, and monitor your progress all in one place."
        features={[
          "Quick access to upcoming therapy sessions",
          "Mental health resources and worksheets",
          "Community engagement overview",
        ]}
        imageSrc="/app-screenshots/client-dashboard.png"
        imageAlt="Client Dashboard"
        imagePosition="right"
      />

      <FeatureShowcase
        badge="Therapist Discovery"
        title="Find Your Perfect Match"
        description="Browse through 100+ licensed therapists with detailed profiles, specializations, ratings, and availability. Filter by expertise, language, and approach to find the right fit for you."
        features={[
          "Detailed therapist profiles with credentials",
          "Filter by specialization and availability",
          "Read reviews and ratings from other clients",
        ]}
        imageSrc="/app-screenshots/client-therapists.png"
        imageAlt="Find Therapists"
        imagePosition="left"
      />

      <FeatureShowcase
        badge="Session Management"
        title="Easy Appointment Booking"
        description="Schedule, manage, and track all your therapy sessions in one place. View upcoming appointments, session history, and receive automated reminders."
        features={[
          "Real-time availability calendar",
          "Automated email and SMS reminders",
          "Integrated payment processing",
        ]}
        imageSrc="/app-screenshots/client-sessions.png"
        imageAlt="Session Booking"
        imagePosition="right"
      />

      <FeatureShowcase
        badge="Communication"
        title="Secure Messaging"
        description="Stay connected with your therapist through secure, encrypted messaging. Share files, ask questions between sessions, and maintain continuity in your care."
        features={[
          "End-to-end encrypted conversations",
          "File sharing and media support",
          "Real-time notifications and read receipts",
        ]}
        imageSrc="/app-screenshots/client-messages.png"
        imageAlt="Secure Messaging"
        imagePosition="left"
      />

      <FeatureShowcase
        badge="AI Assessment"
        title="Intelligent Pre-Assessment"
        description="Complete comprehensive mental health assessments powered by AI. Get personalized insights and match with the right therapist based on your unique needs and concerns."
        features={[
          "Validated psychological assessment tools",
          "AI-powered analysis and recommendations",
          "Progress tracking over time",
        ]}
        imageSrc="/app-screenshots/preassessment-forms.png"
        imageAlt="Pre-Assessment Forms"
        imagePosition="right"
      />

      <FeatureShowcase
        badge="Resources"
        title="Interactive Worksheets"
        description="Access a library of therapeutic worksheets, exercises, and resources. Work on assignments between sessions and track your personal growth."
        features={[
          "Curated mental health resources",
          "Progress tracking and completion status",
          "Share results with your therapist",
        ]}
        imageSrc="/app-screenshots/client-worksheets.png"
        imageAlt="Interactive Worksheets"
        imagePosition="left"
      />

      <FeatureShowcase
        badge="Therapist Tools"
        title="Therapist Dashboard"
        description="Comprehensive practice management tools for therapists. Manage clients, schedule sessions, track earnings, and access patient assessments all in one platform."
        features={[
          "Client management and session history",
          "Revenue tracking and analytics",
          "AI-powered patient insights",
        ]}
        imageSrc="/app-screenshots/therapist-dashboard.png"
        imageAlt="Therapist Dashboard"
        imagePosition="right"
      />

      <FeatureShowcase
        badge="Availability"
        title="Smart Scheduling"
        description="Therapists can easily manage their availability with our intuitive calendar system. Set recurring schedules, block time off, and handle bookings effortlessly."
        features={[
          "Flexible availability management",
          "Automatic conflict detection",
          "One-click booking confirmation",
        ]}
        imageSrc="/app-screenshots/therapist-scheduling.png"
        imageAlt="Therapist Scheduling"
        imagePosition="left"
      />

      <FeatureShowcase
        badge="User Management"
        title="Comprehensive Profiles"
        description="Complete profile management with personal information, preferences, and mental health history. Keep your information secure and up-to-date."
        features={[
          "Secure data storage and privacy controls",
          "Customizable preferences and settings",
          "Mental health history tracking",
        ]}
        imageSrc="/app-screenshots/client-profile.png"
        imageAlt="Client Profile"
        imagePosition="right"
      />
    </div>
  </div>
</section>
