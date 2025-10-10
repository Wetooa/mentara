<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { sendDemoRequest, type DemoFormData } from '$lib/utils/email';

  let formData = $state<DemoFormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    jobTitle: '',
    email: '',
    contactNumber: '',
    companySize: '',
    message: '',
  });

  let isSubmitting = $state(false);
  let submitStatus = $state<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (isSubmitting) return;

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.companyName) {
      submitStatus = {
        type: 'error',
        message: 'Please fill in all required fields.',
      };
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      submitStatus = {
        type: 'error',
        message: 'Please enter a valid email address.',
      };
      return;
    }

    isSubmitting = true;
    submitStatus = { type: null, message: '' };

    try {
      const response = await fetch('/api/submit-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        submitStatus = {
          type: 'success',
          message: result.message,
        };
        // Reset form
        formData = {
          firstName: '',
          lastName: '',
          companyName: '',
          jobTitle: '',
          email: '',
          contactNumber: '',
          companySize: '',
          message: '',
        };
      } else {
        submitStatus = {
          type: 'error',
          message: result.message,
        };
      }
    } catch (error) {
      submitStatus = {
        type: 'error',
        message: 'An error occurred. Please try again later.',
      };
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Book a Demo - Mentara</title>
  <meta name="description" content="Book a demo to see how Mentara can transform your organization's mental health approach." />
</svelte:head>

<div class="min-h-screen bg-background">
  <Navbar />

  <main class="py-12 md:py-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold font-futura mb-4" style="color: var(--primary);">
          Book a Demo
        </h1>
        <p class="text-xl text-muted-foreground font-kollektif">
          Let's explore how Mentara can support your organization's mental health needs
        </p>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-2xl shadow-xl border border-border p-8 md:p-12">
        <form onsubmit={handleSubmit} class="space-y-6">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="firstName" class="block text-sm font-semibold font-kollektif mb-2" style="color: var(--foreground);">
                First Name <span class="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                bind:value={formData.firstName}
                required
                class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
                placeholder="John"
              />
            </div>

            <div>
              <label for="lastName" class="block text-sm font-semibold font-kollektif mb-2" style="color: var(--foreground);">
                Last Name <span class="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                bind:value={formData.lastName}
                required
                class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          <!-- Company Name -->
          <div>
            <label for="companyName" class="block text-sm font-semibold font-kollektif mb-2" style="color: var(--foreground);">
              Company Name <span class="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              bind:value={formData.companyName}
              required
              class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
              placeholder="Acme Corporation"
            />
          </div>

          <!-- Job Title -->
          <div>
            <label for="jobTitle" class="block text-sm font-semibold font-kollektif mb-2" style="color: var(--foreground);">
              Job Title <span class="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="jobTitle"
              bind:value={formData.jobTitle}
              required
              class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
              placeholder="HR Manager"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-semibold font-kollektif mb-2" style="color: var(--foreground);">
              Email Address <span class="text-destructive">*</span>
            </label>
            <input
              type="email"
              id="email"
              bind:value={formData.email}
              required
              class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
              placeholder="john.doe@company.com"
            />
          </div>

          <!-- Contact Number -->
          <div>
            <label for="contactNumber" class="block text-sm font-semibold font-kollektif mb-2" style="color: var(--foreground);">
              Contact Number <span class="text-destructive">*</span>
            </label>
            <input
              type="tel"
              id="contactNumber"
              bind:value={formData.contactNumber}
              required
              class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
              placeholder="+63 912 345 6789"
            />
          </div>

          <!-- Company Size -->
          <div>
            <label for="companySize" class="block text-sm font-semibold font-kollektif mb-2" style="color: var(--foreground);">
              Company Size
            </label>
            <select
              id="companySize"
              bind:value={formData.companySize}
              class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          <!-- Message -->
          <div>
            <label for="message" class="block text-sm font-semibold font-kollektif mb-2" style="color: var(--foreground);">
              Additional Information
            </label>
            <textarea
              id="message"
              bind:value={formData.message}
              rows="5"
              class="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all resize-none"
              placeholder="Tell us more about your needs..."
            ></textarea>
          </div>

          <!-- Submit Status -->
          {#if submitStatus.type}
            <div
              class="p-4 rounded-lg border {submitStatus.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'}"
            >
              <p class="font-kollektif">{submitStatus.message}</p>
            </div>
          {/if}

          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full py-4 rounded-lg text-lg font-semibold font-kollektif transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style="background-color: var(--primary); color: var(--primary-foreground);"
          >
            {isSubmitting ? 'Sending...' : 'Submit Demo Request'}
          </button>
        </form>
      </div>

      <!-- Additional Info -->
      <div class="mt-8 text-center">
        <p class="text-muted-foreground font-kollektif">
          We'll get back to you within 24 hours to schedule your personalized demo.
        </p>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="py-12 border-t border-border bg-muted/30 mt-20">
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

