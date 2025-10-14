<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";

  interface DemoFormData {
    firstName: string;
    lastName: string;
    companyName: string;
    jobTitle: string;
    email: string;
    contactNumber: string;
    companySize?: string;
    message?: string;
  }

  // Check if we're in debug mode
  const IS_DEBUG = import.meta.env.MODE === "development";

  let formData = $state<DemoFormData>({
    firstName: IS_DEBUG ? "John" : "",
    lastName: IS_DEBUG ? "Doe" : "",
    companyName: IS_DEBUG ? "Acme Corporation" : "",
    jobTitle: IS_DEBUG ? "HR Manager" : "",
    email: IS_DEBUG ? "derpykidyt@gmail.com" : "",
    contactNumber: IS_DEBUG ? "+63 912 345 6789" : "",
    companySize: IS_DEBUG ? "51-200" : "",
    message: IS_DEBUG
      ? "I would like to learn more about Mentara for our organization."
      : "",
  });

  let isSubmitting = $state(false);
  let submitStatus = $state<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (isSubmitting) return;

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.companyName
    ) {
      submitStatus = {
        type: "error",
        message: "Please fill in all required fields.",
      };
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      submitStatus = {
        type: "error",
        message: "Please enter a valid email address.",
      };
      return;
    }

    isSubmitting = true;
    submitStatus = { type: null, message: "" };

    try {
      const response = await fetch("/api/submit-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        submitStatus = {
          type: "success",
          message: result.message,
        };
        // Reset form
        formData = {
          firstName: "",
          lastName: "",
          companyName: "",
          jobTitle: "",
          email: "",
          contactNumber: "",
          companySize: "",
          message: "",
        };
      } else {
        submitStatus = {
          type: "error",
          message: result.message,
        };
      }
    } catch (error) {
      submitStatus = {
        type: "error",
        message: "An error occurred. Please try again later.",
      };
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Book a Demo - Mentara</title>
  <meta
    name="description"
    content="Book a demo to see how Mentara can transform your organization's mental health approach."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <Navbar />

  <main class="py-0 md:py-8 lg:px-8 lg:pb-8">
    <div class="max-w-7xl mx-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-8rem)]">
      <!-- Two Panel Layout with Rounded Container -->
      <div
        class="grid grid-cols-1 lg:grid-cols-2 h-full lg:rounded-3xl lg:shadow-2xl overflow-hidden lg:border lg:border-border"
      >
        <!-- Left Panel: Corporate Image -->
        <div
          class="relative hidden lg:block bg-gradient-to-br overflow-hidden"
          style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
        >
          <div class="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=1000&fit=crop"
              alt="Professional team in modern corporate office"
              class="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
          </div>

          <!-- Content Overlay -->
          <div
            class="relative z-10 flex flex-col justify-between h-full p-12 text-white"
          >
            <!-- Top Content -->
            <div class="space-y-6">
              <div class="inline-block">
                <img
                  src="/icons/mentara/mentara-with-text.png"
                  alt="Mentara"
                  class="h-12 brightness-0 invert"
                />
              </div>
              <h2 class="text-4xl font-bold font-futura leading-tight">
                Transform Your Organization's Mental Health
              </h2>
              <p class="text-xl font-kollektif text-white/90 leading-relaxed">
                Join leading organizations in creating a mentally healthy
                workplace with data-driven insights and 24/7 support.
              </p>
            </div>

            <!-- Bottom Stats/Features -->
            <div class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div class="flex items-start space-x-3">
                  <svg
                    class="w-6 h-6 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <div class="font-semibold font-kollektif">24/7 Access</div>
                    <div class="text-sm text-white/80">Always available</div>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <svg
                    class="w-6 h-6 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <div class="font-semibold font-kollektif">
                      Growing Therapists
                    </div>
                    <div class="text-sm text-white/80">
                      Licensed professionals
                    </div>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <svg
                    class="w-6 h-6 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <div class="font-semibold font-kollektif">Data-Driven</div>
                    <div class="text-sm text-white/80">
                      Insights & analytics
                    </div>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <svg
                    class="w-6 h-6 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <div class="font-semibold font-kollektif">
                      Growing support
                    </div>
                    <div class="text-sm text-white/80">Organizations</div>
                  </div>
                </div>
              </div>

              <div class="pt-6 border-t border-white/20">
                <p class="text-sm text-white/70 font-kollektif">
                  "Mentara has transformed how we approach employee mental
                  health. The platform is intuitive and our team loves it."
                </p>
                <p class="text-sm text-white/90 font-semibold mt-2">
                  — HR Director, Fortune 500 Company
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Form -->
        <div class="bg-white overflow-y-auto">
          <div class="p-6 md:p-8 lg:p-10 h-full flex flex-col">
            <!-- Header -->
            <div class="mb-8">
              <div
                class="inline-block px-3 py-1 rounded-full mb-4"
                style="background-color: oklch(0.98 0.0464 124.31);"
              >
                <span
                  class="text-sm font-semibold font-kollektif"
                  style="color: var(--primary);">Let's Connect</span
                >
              </div>
              <h1
                class="text-3xl md:text-4xl font-bold font-futura mb-3"
                style="color: var(--primary);"
              >
                Book Your Demo
              </h1>
              <p class="text-lg text-muted-foreground font-kollektif">
                Fill out the form below and we'll get back to you within 24
                hours
              </p>
            </div>

            <!-- Form -->
            <form onsubmit={handleSubmit} class="space-y-6">
              <!-- Name Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    for="firstName"
                    class="block text-xs font-semibold font-kollektif mb-1"
                    style="color: var(--foreground);"
                  >
                    First Name <span class="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    bind:value={formData.firstName}
                    required
                    class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label
                    for="lastName"
                    class="block text-xs font-semibold font-kollektif mb-1"
                    style="color: var(--foreground);"
                  >
                    Last Name <span class="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    bind:value={formData.lastName}
                    required
                    class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <!-- Company Name -->
              <div>
                <label
                  for="companyName"
                  class="block text-xs font-semibold font-kollektif mb-1"
                  style="color: var(--foreground);"
                >
                  Company Name <span class="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  bind:value={formData.companyName}
                  required
                  class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
                  placeholder="Acme Corporation"
                />
              </div>

              <!-- Job Title -->
              <div>
                <label
                  for="jobTitle"
                  class="block text-xs font-semibold font-kollektif mb-1"
                  style="color: var(--foreground);"
                >
                  Job Title <span class="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  bind:value={formData.jobTitle}
                  required
                  class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
                  placeholder="HR Manager"
                />
              </div>

              <!-- Email -->
              <div>
                <label
                  for="email"
                  class="block text-xs font-semibold font-kollektif mb-1"
                  style="color: var(--foreground);"
                >
                  Email Address <span class="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  bind:value={formData.email}
                  required
                  class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
                  placeholder="john.doe@company.com"
                />
              </div>

              <!-- Contact Number -->
              <div>
                <label
                  for="contactNumber"
                  class="block text-xs font-semibold font-kollektif mb-1"
                  style="color: var(--foreground);"
                >
                  Contact Number <span class="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  bind:value={formData.contactNumber}
                  required
                  class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
                  placeholder="+63 912 345 6789"
                />
              </div>

              <!-- Company Size -->
              <div>
                <label
                  for="companySize"
                  class="block text-xs font-semibold font-kollektif mb-1"
                  style="color: var(--foreground);"
                >
                  Company Size
                </label>
                <select
                  id="companySize"
                  bind:value={formData.companySize}
                  class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
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
                <label
                  for="message"
                  class="block text-xs font-semibold font-kollektif mb-1"
                  style="color: var(--foreground);"
                >
                  Additional Information
                </label>
                <textarea
                  id="message"
                  bind:value={formData.message}
                  rows="3"
                  class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all resize-none"
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
                class="w-full py-3 text-sm rounded-lg font-semibold font-kollektif transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style="background: linear-gradient(to right, var(--primary), var(--secondary)); color: var(--primary-foreground);"
              >
                {isSubmitting ? "Sending..." : "Submit Demo Request"}
              </button>
            </form>

            <!-- Additional Info -->
            <div class="mt-8 text-center">
              <p class="text-muted-foreground font-kollektif text-sm">
                We'll get back to you within 24 hours to schedule your
                personalized demo.
              </p>
              {#if IS_DEBUG}
                <div
                  class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <p class="text-sm text-yellow-800 font-kollektif">
                    🐛 <strong>Debug Mode Active</strong> - Form pre-filled with
                    test data
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
