<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import HeroSection from "$lib/components/about/HeroSection.svelte";
  import EnterpriseSection from "$lib/components/about/EnterpriseSection.svelte";
  import SecuritySection from "$lib/components/about/SecuritySection.svelte";
  import AppScreenshots from "$lib/components/about/AppScreenshots.svelte";
  import TeamSection from "$lib/components/about/TeamSection.svelte";
  import CTASection from "$lib/components/about/CTASection.svelte";
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
    <HeroSection />
    <EnterpriseSection />
    <SecuritySection />
    <AppScreenshots />
    <TeamSection />
    <CTASection />
  </main>

  <Footer />
</div>
