import { a6 as attr_style, Z as FILENAME, a5 as stringify, $ as prevent_snippet_stringification, a3 as attr_class, a2 as escape_html, a7 as ensure_array_like, a8 as attr, a0 as head } from "../../../chunks/index.js";
import { N as Navbar } from "../../../chunks/Navbar.js";
import { A as AnimateOnScroll, F as Footer } from "../../../chunks/Footer.js";
import "../../../chunks/index-client.js";
import { p as push_element, a as pop_element, v as validate_snippet_args } from "../../../chunks/dev.js";
ParallaxDots[FILENAME] = "src/lib/components/ParallaxDots.svelte";
function ParallaxDots($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      let { variant = "green" } = $$props;
      $$renderer2.push(`<div class="absolute inset-0 pointer-events-none overflow-visible -z-10 svelte-t9bxr1">`);
      push_element($$renderer2, "div", 5, 0);
      $$renderer2.push(`<div class="absolute w-64 h-64 rounded-full blur-3xl opacity-20 animate-float-slow svelte-t9bxr1"${attr_style(` top: 5%; left: 2%; background-color: ${stringify(variant === "green" ? "var(--primary)" : "var(--secondary)")}; `)}>`);
      push_element($$renderer2, "div", 7, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-80 h-80 rounded-full blur-3xl opacity-15 animate-float-slower svelte-t9bxr1"${attr_style(` top: 35%; right: 5%; background-color: ${stringify(variant === "green" ? "var(--secondary)" : "var(--primary)")}; `)}>`);
      push_element($$renderer2, "div", 18, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-48 h-48 rounded-full blur-2xl opacity-25 animate-float-medium svelte-t9bxr1"${attr_style(` bottom: 15%; left: 8%; background-color: ${stringify(variant === "green" ? "oklch(0.98 0.0464 124.31)" : "var(--primary)")}; `)}>`);
      push_element($$renderer2, "div", 29, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-3 h-3 rounded-full animate-pulse svelte-t9bxr1"${attr_style(` top: 12%; right: 15%; background-color: ${stringify(variant === "green" ? "var(--primary)" : "var(--secondary)")}; opacity: 0.3; `)}>`);
      push_element($$renderer2, "div", 41, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-2 h-2 rounded-full animate-pulse delay-500 svelte-t9bxr1"${attr_style(` top: 55%; left: 12%; background-color: ${stringify(variant === "green" ? "var(--secondary)" : "var(--primary)")}; opacity: 0.4; `)}>`);
      push_element($$renderer2, "div", 53, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-4 h-4 rounded-full animate-pulse delay-1000 svelte-t9bxr1"${attr_style(` bottom: 25%; right: 18%; background-color: ${stringify(variant === "green" ? "oklch(0.98 0.0464 124.31)" : "var(--primary)")}; opacity: 0.35; `)}>`);
      push_element($$renderer2, "div", 65, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-8 h-8 rounded-full opacity-20 animate-float-fast svelte-t9bxr1"${attr_style(` top: 20%; left: 8%; background-color: ${stringify(variant === "green" ? "var(--primary)" : "var(--secondary)")}; `)}>`);
      push_element($$renderer2, "div", 78, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-6 h-6 rounded-full opacity-25 animate-float-medium svelte-t9bxr1"${attr_style(` bottom: 35%; right: 10%; background-color: ${stringify(variant === "green" ? "var(--secondary)" : "oklch(0.98 0.0464 124.31)")}; `)}>`);
      push_element($$renderer2, "div", 89, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-2 h-2 rounded-full opacity-30 svelte-t9bxr1"${attr_style(` top: 45%; right: 25%; background-color: ${stringify(variant === "green" ? "var(--primary)" : "var(--secondary)")}; `)}>`);
      push_element($$renderer2, "div", 101, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute w-3 h-3 rounded-full opacity-25 animate-pulse svelte-t9bxr1"${attr_style(` bottom: 50%; left: 20%; background-color: ${stringify(variant === "green" ? "oklch(0.98 0.0464 124.31)" : "var(--secondary)")}; `)}>`);
      push_element($$renderer2, "div", 112, 2);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
    },
    ParallaxDots
  );
}
ParallaxDots.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
HeroSection[FILENAME] = "src/lib/components/about/HeroSection.svelte";
function HeroSection($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      $$renderer2.push(`<section class="py-20 md:py-32 relative bg-white">`);
      push_element($$renderer2, "section", 6, 0);
      ParallaxDots($$renderer2, { variant: "white" });
      $$renderer2.push(`<!----> <div class="absolute inset-0 -z-10">`);
      push_element($$renderer2, "div", 8, 2);
      $$renderer2.push(`<div class="absolute inset-0 bg-gradient-to-br from-white via-[oklch(0.98_0.0464_124.31)]/10 to-white">`);
      push_element($$renderer2, "div", 9, 4);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 14, 2);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="text-center max-w-4xl mx-auto">`);
          push_element($$renderer3, "div", 17, 8);
          $$renderer3.push(`<div class="inline-block px-4 py-2 rounded-full mb-6" style="background-color: oklch(0.98 0.0464 124.31);">`);
          push_element($$renderer3, "div", 18, 10);
          $$renderer3.push(`<span class="font-semibold font-kollektif text-sm" style="color: var(--primary);">`);
          push_element($$renderer3, "span", 22, 12);
          $$renderer3.push(`About Mentara</span>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h1 class="text-4xl md:text-6xl font-bold font-futura mb-6 bg-gradient-to-r bg-clip-text text-transparent" style="background-image: linear-gradient(to right, var(--primary), var(--secondary));">`);
          push_element($$renderer3, "h1", 27, 10);
          $$renderer3.push(`Transforming Mental Health Care with Technology</h1>`);
          pop_element();
          $$renderer3.push(` <p class="text-xl text-muted-foreground font-kollektif leading-relaxed">`);
          push_element($$renderer3, "p", 33, 10);
          $$renderer3.push(`Mentara is a comprehensive mental health platform designed to
            provide accessible, data-driven mental health support for
            individuals and organizations.</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { y: 30, duration: 800, children });
      }
      $$renderer2.push(`<!----></div>`);
      pop_element();
      $$renderer2.push(`</section>`);
      pop_element();
    },
    HeroSection
  );
}
HeroSection.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
EnterpriseSection[FILENAME] = "src/lib/components/about/EnterpriseSection.svelte";
function EnterpriseSection($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      $$renderer2.push(`<section class="py-20 relative" style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.15) 0%, oklch(0.98 0.0464 124.31 / 0.05) 100%);">`);
      push_element($$renderer2, "section", 6, 0);
      ParallaxDots($$renderer2, { variant: "green" });
      $$renderer2.push(`<!----> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 11, 2);
      $$renderer2.push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">`);
      push_element($$renderer2, "div", 12, 4);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="relative rounded-2xl shadow-2xl overflow-hidden">`);
          push_element($$renderer3, "div", 15, 10);
          $$renderer3.push(`<img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&amp;h=600&amp;fit=crop" alt="Team collaboration and analytics" class="w-full h-auto object-cover"/>`);
          push_element($$renderer3, "img", 16, 12);
          pop_element();
          $$renderer3.push(` <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">`);
          push_element($$renderer3, "div", 21, 12);
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <div class="absolute bottom-6 left-6 right-6 text-white">`);
          push_element($$renderer3, "div", 24, 12);
          $$renderer3.push(`<p class="text-2xl font-bold font-futura">`);
          push_element($$renderer3, "p", 25, 14);
          $$renderer3.push(`Enterprise-Grade Platform</p>`);
          pop_element();
          $$renderer3.push(` <p class="text-sm mt-2 font-kollektif">`);
          push_element($$renderer3, "p", 28, 14);
          $$renderer3.push(`Built for scale and reliability</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { x: -40, duration: 800, children });
      }
      $$renderer2.push(`<!----> `);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div>`);
          push_element($$renderer3, "div", 38, 10);
          $$renderer3.push(`<div class="inline-block px-3 py-1 rounded-full mb-4" style="background-color: oklch(0.98 0.0464 124.31);">`);
          push_element($$renderer3, "div", 39, 12);
          $$renderer3.push(`<span class="text-xs font-semibold font-kollektif" style="color: var(--primary);">`);
          push_element($$renderer3, "span", 43, 14);
          $$renderer3.push(`Enterprise Ready</span>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h2 class="text-3xl md:text-4xl font-bold font-futura mb-6" style="color: var(--primary);">`);
          push_element($$renderer3, "h2", 48, 12);
          $$renderer3.push(`Built for Organizations</h2>`);
          pop_element();
          $$renderer3.push(` <div class="space-y-4 text-muted-foreground font-kollektif">`);
          push_element($$renderer3, "div", 54, 12);
          $$renderer3.push(`<p class="text-lg leading-relaxed">`);
          push_element($$renderer3, "p", 55, 14);
          $$renderer3.push(`Mentara implements a robust <strong>`);
          push_element($$renderer3, "strong", 56, 44);
          $$renderer3.push(`microservices architecture</strong>`);
          pop_element();
          $$renderer3.push(` designed for enterprise scalability and reliability. Our platform
                handles thousands of concurrent users while maintaining sub-100ms
                API response times.</p>`);
          pop_element();
          $$renderer3.push(` <div class="grid grid-cols-2 gap-4 pt-4">`);
          push_element($$renderer3, "div", 62, 14);
          $$renderer3.push(`<div class="p-4 rounded-xl border" style="border-color: var(--primary); border-opacity: 0.2;">`);
          push_element($$renderer3, "div", 63, 16);
          $$renderer3.push(`<div class="text-2xl font-bold font-futura mb-1" style="color: var(--primary);">`);
          push_element($$renderer3, "div", 67, 18);
          $$renderer3.push(`140+</div>`);
          pop_element();
          $$renderer3.push(` <div class="text-sm">`);
          push_element($$renderer3, "div", 73, 18);
          $$renderer3.push(`API Endpoints</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <div class="p-4 rounded-xl border" style="border-color: var(--primary); border-opacity: 0.2;">`);
          push_element($$renderer3, "div", 75, 16);
          $$renderer3.push(`<div class="text-2xl font-bold font-futura mb-1" style="color: var(--primary);">`);
          push_element($$renderer3, "div", 79, 18);
          $$renderer3.push(`17</div>`);
          pop_element();
          $$renderer3.push(` <div class="text-sm">`);
          push_element($$renderer3, "div", 85, 18);
          $$renderer3.push(`Service Modules</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <div class="p-4 rounded-xl border" style="border-color: var(--primary); border-opacity: 0.2;">`);
          push_element($$renderer3, "div", 87, 16);
          $$renderer3.push(`<div class="text-2xl font-bold font-futura mb-1" style="color: var(--primary);">`);
          push_element($$renderer3, "div", 91, 18);
          $$renderer3.push(`99.9%</div>`);
          pop_element();
          $$renderer3.push(` <div class="text-sm">`);
          push_element($$renderer3, "div", 97, 18);
          $$renderer3.push(`Uptime SLA</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <div class="p-4 rounded-xl border" style="border-color: var(--primary); border-opacity: 0.2;">`);
          push_element($$renderer3, "div", 99, 16);
          $$renderer3.push(`<div class="text-2xl font-bold font-futura mb-1" style="color: var(--primary);">`);
          push_element($$renderer3, "div", 103, 18);
          $$renderer3.push(`&lt;100ms</div>`);
          pop_element();
          $$renderer3.push(` <div class="text-sm">`);
          push_element($$renderer3, "div", 109, 18);
          $$renderer3.push(`API Response</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { x: 40, duration: 800, children });
      }
      $$renderer2.push(`<!----></div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</section>`);
      pop_element();
    },
    EnterpriseSection
  );
}
EnterpriseSection.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
SecuritySection[FILENAME] = "src/lib/components/about/SecuritySection.svelte";
function SecuritySection($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      $$renderer2.push(`<section class="py-20 relative bg-white">`);
      push_element($$renderer2, "section", 6, 0);
      ParallaxDots($$renderer2, { variant: "white" });
      $$renderer2.push(`<!----> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 8, 2);
      $$renderer2.push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">`);
      push_element($$renderer2, "div", 9, 4);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="lg:order-2">`);
          push_element($$renderer3, "div", 12, 10);
          $$renderer3.push(`<div class="inline-block px-3 py-1 rounded-full mb-4" style="background-color: oklch(0.98 0.0464 124.31);">`);
          push_element($$renderer3, "div", 13, 12);
          $$renderer3.push(`<span class="text-xs font-semibold font-kollektif" style="color: var(--primary);">`);
          push_element($$renderer3, "span", 17, 14);
          $$renderer3.push(`Security First</span>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h2 class="text-3xl md:text-4xl font-bold font-futura mb-6" style="color: var(--primary);">`);
          push_element($$renderer3, "h2", 22, 12);
          $$renderer3.push(`HIPAA-Compliant Security</h2>`);
          pop_element();
          $$renderer3.push(` <p class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6">`);
          push_element($$renderer3, "p", 28, 12);
          $$renderer3.push(`Your data security and privacy are paramount. Mentara implements <strong>`);
          push_element($$renderer3, "strong", 31, 79);
          $$renderer3.push(`end-to-end encryption</strong>`);
          pop_element();
          $$renderer3.push(`, secure JWT authentication with bcrypt hashing, and HIPAA
              compliance considerations for all health data.</p>`);
          pop_element();
          $$renderer3.push(` <ul class="space-y-4">`);
          push_element($$renderer3, "ul", 36, 12);
          $$renderer3.push(`<li class="flex items-start">`);
          push_element($$renderer3, "li", 37, 14);
          $$renderer3.push(`<span class="text-xl mr-3">`);
          push_element($$renderer3, "span", 38, 16);
          $$renderer3.push(`🔒</span>`);
          pop_element();
          $$renderer3.push(` <div>`);
          push_element($$renderer3, "div", 39, 16);
          $$renderer3.push(`<div class="font-semibold mb-1" style="color: var(--primary);">`);
          push_element($$renderer3, "div", 40, 18);
          $$renderer3.push(`End-to-End Encryption</div>`);
          pop_element();
          $$renderer3.push(` <div class="text-sm text-muted-foreground">`);
          push_element($$renderer3, "div", 46, 18);
          $$renderer3.push(`All sensitive data encrypted in transit and at rest using
                    AES-256</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</li>`);
          pop_element();
          $$renderer3.push(` <li class="flex items-start">`);
          push_element($$renderer3, "li", 52, 14);
          $$renderer3.push(`<span class="text-xl mr-3">`);
          push_element($$renderer3, "span", 53, 16);
          $$renderer3.push(`🛡️</span>`);
          pop_element();
          $$renderer3.push(` <div>`);
          push_element($$renderer3, "div", 54, 16);
          $$renderer3.push(`<div class="font-semibold mb-1" style="color: var(--primary);">`);
          push_element($$renderer3, "div", 55, 18);
          $$renderer3.push(`Role-Based Access Control</div>`);
          pop_element();
          $$renderer3.push(` <div class="text-sm text-muted-foreground">`);
          push_element($$renderer3, "div", 61, 18);
          $$renderer3.push(`Comprehensive RBAC with granular permissions for clients,
                    therapists, moderators, and admins</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</li>`);
          pop_element();
          $$renderer3.push(` <li class="flex items-start">`);
          push_element($$renderer3, "li", 67, 14);
          $$renderer3.push(`<span class="text-xl mr-3">`);
          push_element($$renderer3, "span", 68, 16);
          $$renderer3.push(`🔐</span>`);
          pop_element();
          $$renderer3.push(` <div>`);
          push_element($$renderer3, "div", 69, 16);
          $$renderer3.push(`<div class="font-semibold mb-1" style="color: var(--primary);">`);
          push_element($$renderer3, "div", 70, 18);
          $$renderer3.push(`Secure Authentication</div>`);
          pop_element();
          $$renderer3.push(` <div class="text-sm text-muted-foreground">`);
          push_element($$renderer3, "div", 76, 18);
          $$renderer3.push(`JWT-based authentication with bcrypt password hashing and
                    session management</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</li>`);
          pop_element();
          $$renderer3.push(` <li class="flex items-start">`);
          push_element($$renderer3, "li", 82, 14);
          $$renderer3.push(`<span class="text-xl mr-3">`);
          push_element($$renderer3, "span", 83, 16);
          $$renderer3.push(`📋</span>`);
          pop_element();
          $$renderer3.push(` <div>`);
          push_element($$renderer3, "div", 84, 16);
          $$renderer3.push(`<div class="font-semibold mb-1" style="color: var(--primary);">`);
          push_element($$renderer3, "div", 85, 18);
          $$renderer3.push(`Audit Logging</div>`);
          pop_element();
          $$renderer3.push(` <div class="text-sm text-muted-foreground">`);
          push_element($$renderer3, "div", 91, 18);
          $$renderer3.push(`Comprehensive audit trails for all critical operations and
                    data access</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</li>`);
          pop_element();
          $$renderer3.push(`</ul>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { x: 40, duration: 800, children });
      }
      $$renderer2.push(`<!----> `);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="lg:order-1 relative rounded-2xl shadow-2xl overflow-hidden">`);
          push_element($$renderer3, "div", 104, 10);
          $$renderer3.push(`<img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&amp;h=600&amp;fit=crop" alt="Security and data protection" class="w-full h-auto object-cover"/>`);
          push_element($$renderer3, "img", 107, 12);
          pop_element();
          $$renderer3.push(` <div class="absolute inset-0 bg-gradient-to-br from-[oklch(0.56_0.1223_127.47)]/40 to-[oklch(0.4_0.0812_92.8)]/40">`);
          push_element($$renderer3, "div", 112, 12);
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { x: -40, duration: 800, children });
      }
      $$renderer2.push(`<!----></div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</section>`);
      pop_element();
    },
    SecuritySection
  );
}
SecuritySection.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
FeatureShowcase[FILENAME] = "src/lib/components/FeatureShowcase.svelte";
function FeatureShowcase($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      let {
        badge,
        title,
        description,
        features,
        imageSrc,
        imageAlt,
        imagePosition = "right"
      } = $$props;
      const isImageRight = imagePosition === "right";
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">`);
          push_element($$renderer3, "div", 27, 4);
          $$renderer3.push(`<div${attr_class("", void 0, { "lg:order-1": isImageRight, "lg:order-2": !isImageRight })}>`);
          push_element($$renderer3, "div", 29, 6);
          $$renderer3.push(`<div class="inline-block px-3 py-1 rounded-full mb-4" style="background-color: oklch(0.98 0.0464 124.31);">`);
          push_element($$renderer3, "div", 30, 8);
          $$renderer3.push(`<span class="text-xs font-semibold font-kollektif" style="color: var(--primary);">`);
          push_element($$renderer3, "span", 34, 10);
          $$renderer3.push(`${escape_html(badge)}</span>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h3 class="text-3xl md:text-4xl font-bold font-futura mb-4" style="color: var(--primary);">`);
          push_element($$renderer3, "h3", 39, 8);
          $$renderer3.push(`${escape_html(title)}</h3>`);
          pop_element();
          $$renderer3.push(` <p class="text-lg text-muted-foreground font-kollektif leading-relaxed mb-6">`);
          push_element($$renderer3, "p", 45, 8);
          $$renderer3.push(`${escape_html(description)}</p>`);
          pop_element();
          $$renderer3.push(` <ul class="space-y-3">`);
          push_element($$renderer3, "ul", 50, 8);
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(features);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let feature = each_array[$$index];
            $$renderer3.push(`<li class="flex items-start">`);
            push_element($$renderer3, "li", 52, 12);
            $$renderer3.push(`<span class="mr-2 mt-1" style="color: var(--primary);">`);
            push_element($$renderer3, "span", 53, 14);
            $$renderer3.push(`✓</span>`);
            pop_element();
            $$renderer3.push(` <span class="text-muted-foreground font-kollektif">`);
            push_element($$renderer3, "span", 54, 14);
            $$renderer3.push(`${escape_html(feature)}</span>`);
            pop_element();
            $$renderer3.push(`</li>`);
            pop_element();
          }
          $$renderer3.push(`<!--]--></ul>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <div${attr_class("", void 0, { "lg:order-2": isImageRight, "lg:order-1": !isImageRight })}>`);
          push_element($$renderer3, "div", 62, 6);
          $$renderer3.push(`<div class="relative rounded-2xl shadow-2xl border-2 group overflow-hidden" style="border-color: var(--primary); border-opacity: 0.2;">`);
          push_element($$renderer3, "div", 63, 8);
          $$renderer3.push(`<img${attr("src", imageSrc)}${attr("alt", imageAlt)} class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"/>`);
          push_element($$renderer3, "img", 67, 10);
          pop_element();
          $$renderer3.push(` <div class="absolute inset-0 bg-gradient-to-t from-[oklch(0.56_0.1223_127.47)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">`);
          push_element($$renderer3, "div", 72, 10);
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { y: 50, duration: 800, children });
      }
    },
    FeatureShowcase
  );
}
FeatureShowcase.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
AppScreenshots[FILENAME] = "src/lib/components/about/AppScreenshots.svelte";
function AppScreenshots($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      $$renderer2.push(`<section class="py-20 relative bg-white">`);
      push_element($$renderer2, "section", 7, 0);
      ParallaxDots($$renderer2, { variant: "white" });
      $$renderer2.push(`<!----> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 9, 2);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="text-center mb-16">`);
          push_element($$renderer3, "div", 12, 8);
          $$renderer3.push(`<h2 class="text-3xl md:text-5xl font-bold font-futura mb-4" style="color: var(--primary);">`);
          push_element($$renderer3, "h2", 13, 10);
          $$renderer3.push(`Explore the Platform</h2>`);
          pop_element();
          $$renderer3.push(` <p class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto">`);
          push_element($$renderer3, "p", 19, 10);
          $$renderer3.push(`A complete mental health ecosystem in one seamless application</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { y: 30, duration: 600, children });
      }
      $$renderer2.push(`<!----> <div class="space-y-24">`);
      push_element($$renderer2, "div", 28, 4);
      FeatureShowcase($$renderer2, {
        badge: "Client Portal",
        title: "Personalized Dashboard",
        description: "A comprehensive view of your mental health journey. Track appointments, view upcoming sessions, access resources, and monitor your progress all in one place.",
        features: [
          "Quick access to upcoming therapy sessions",
          "Mental health resources and worksheets",
          "Community engagement overview"
        ],
        imageSrc: "/app-screenshots/client-dashboard.png",
        imageAlt: "Client Dashboard",
        imagePosition: "right"
      });
      $$renderer2.push(`<!----> `);
      FeatureShowcase($$renderer2, {
        badge: "Therapist Discovery",
        title: "Find Your Perfect Match",
        description: "Browse through 100+ licensed therapists with detailed profiles, specializations, ratings, and availability. Filter by expertise, language, and approach to find the right fit for you.",
        features: [
          "Detailed therapist profiles with credentials",
          "Filter by specialization and availability",
          "Read reviews and ratings from other clients"
        ],
        imageSrc: "/app-screenshots/client-therapists.png",
        imageAlt: "Find Therapists",
        imagePosition: "left"
      });
      $$renderer2.push(`<!----> `);
      FeatureShowcase($$renderer2, {
        badge: "Session Management",
        title: "Easy Appointment Booking",
        description: "Schedule, manage, and track all your therapy sessions in one place. View upcoming appointments, session history, and receive automated reminders.",
        features: [
          "Real-time availability calendar",
          "Automated email and SMS reminders",
          "Integrated payment processing"
        ],
        imageSrc: "/app-screenshots/client-sessions.png",
        imageAlt: "Session Booking",
        imagePosition: "right"
      });
      $$renderer2.push(`<!----> `);
      FeatureShowcase($$renderer2, {
        badge: "Communication",
        title: "Secure Messaging",
        description: "Stay connected with your therapist through secure, encrypted messaging. Share files, ask questions between sessions, and maintain continuity in your care.",
        features: [
          "End-to-end encrypted conversations",
          "File sharing and media support",
          "Real-time notifications and read receipts"
        ],
        imageSrc: "/app-screenshots/client-messages.png",
        imageAlt: "Secure Messaging",
        imagePosition: "left"
      });
      $$renderer2.push(`<!----> `);
      FeatureShowcase($$renderer2, {
        badge: "AI Assessment",
        title: "Intelligent Pre-Assessment",
        description: "Complete comprehensive mental health assessments powered by AI. Get personalized insights and match with the right therapist based on your unique needs and concerns.",
        features: [
          "Validated psychological assessment tools",
          "AI-powered analysis and recommendations",
          "Progress tracking over time"
        ],
        imageSrc: "/app-screenshots/preassessment-forms.png",
        imageAlt: "Pre-Assessment Forms",
        imagePosition: "right"
      });
      $$renderer2.push(`<!----> `);
      FeatureShowcase($$renderer2, {
        badge: "Resources",
        title: "Interactive Worksheets",
        description: "Access a library of therapeutic worksheets, exercises, and resources. Work on assignments between sessions and track your personal growth.",
        features: [
          "Curated mental health resources",
          "Progress tracking and completion status",
          "Share results with your therapist"
        ],
        imageSrc: "/app-screenshots/client-worksheets.png",
        imageAlt: "Interactive Worksheets",
        imagePosition: "left"
      });
      $$renderer2.push(`<!----> `);
      FeatureShowcase($$renderer2, {
        badge: "Therapist Tools",
        title: "Therapist Dashboard",
        description: "Comprehensive practice management tools for therapists. Manage clients, schedule sessions, track earnings, and access patient assessments all in one platform.",
        features: [
          "Client management and session history",
          "Revenue tracking and analytics",
          "AI-powered patient insights"
        ],
        imageSrc: "/app-screenshots/therapist-dashboard.png",
        imageAlt: "Therapist Dashboard",
        imagePosition: "right"
      });
      $$renderer2.push(`<!----> `);
      FeatureShowcase($$renderer2, {
        badge: "Availability",
        title: "Smart Scheduling",
        description: "Therapists can easily manage their availability with our intuitive calendar system. Set recurring schedules, block time off, and handle bookings effortlessly.",
        features: [
          "Flexible availability management",
          "Automatic conflict detection",
          "One-click booking confirmation"
        ],
        imageSrc: "/app-screenshots/therapist-scheduling.png",
        imageAlt: "Therapist Scheduling",
        imagePosition: "left"
      });
      $$renderer2.push(`<!----> `);
      FeatureShowcase($$renderer2, {
        badge: "User Management",
        title: "Comprehensive Profiles",
        description: "Complete profile management with personal information, preferences, and mental health history. Keep your information secure and up-to-date.",
        features: [
          "Secure data storage and privacy controls",
          "Customizable preferences and settings",
          "Mental health history tracking"
        ],
        imageSrc: "/app-screenshots/client-profile.png",
        imageAlt: "Client Profile",
        imagePosition: "right"
      });
      $$renderer2.push(`<!----></div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</section>`);
      pop_element();
    },
    AppScreenshots
  );
}
AppScreenshots.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
TeamSection[FILENAME] = "src/lib/components/about/TeamSection.svelte";
function TeamSection($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      $$renderer2.push(`<section class="py-20 relative" style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.08) 0%, oklch(0.98 0.0464 124.31 / 0.12) 100%);">`);
      push_element($$renderer2, "section", 6, 0);
      ParallaxDots($$renderer2, { variant: "green" });
      $$renderer2.push(`<!----> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 8, 2);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="text-center mb-16">`);
          push_element($$renderer3, "div", 11, 8);
          $$renderer3.push(`<h2 class="text-3xl md:text-5xl font-bold font-futura mb-4" style="color: var(--primary);">`);
          push_element($$renderer3, "h2", 12, 10);
          $$renderer3.push(`Meet Our Team</h2>`);
          pop_element();
          $$renderer3.push(` <p class="text-lg text-muted-foreground font-kollektif max-w-2xl mx-auto">`);
          push_element($$renderer3, "p", 18, 10);
          $$renderer3.push(`The passionate individuals behind Mentara</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { y: 30, duration: 600, children });
      }
      $$renderer2.push(`<!----> <div class="grid grid-cols-1 md:grid-cols-3 gap-8">`);
      push_element($$renderer2, "div", 25, 4);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="text-center group">`);
          push_element($$renderer3, "div", 29, 10);
          $$renderer3.push(`<div class="relative mb-6 overflow-hidden rounded-2xl">`);
          push_element($$renderer3, "div", 30, 12);
          $$renderer3.push(`<img src="/team/tolentino.jpg" alt="Tristan James C. Tolentino" class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"/>`);
          push_element($$renderer3, "img", 31, 14);
          pop_element();
          $$renderer3.push(` <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">`);
          push_element($$renderer3, "div", 36, 14);
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">`);
          push_element($$renderer3, "h3", 40, 12);
          $$renderer3.push(`Tristan James C. Tolentino</h3>`);
          pop_element();
          $$renderer3.push(` <p class="text-muted-foreground font-kollektif text-sm mb-3">`);
          push_element($$renderer3, "p", 46, 12);
          $$renderer3.push(`Co-Founder &amp; External Partnerships Lead</p>`);
          pop_element();
          $$renderer3.push(` <p class="text-xs text-muted-foreground font-kollektif">`);
          push_element($$renderer3, "p", 49, 12);
          $$renderer3.push(`Leading strategic partnerships and business development to
              expand Mentara's reach and impact in mental health care.</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, {
          y: 40,
          duration: 600,
          delay: 100,
          children
        });
      }
      $$renderer2.push(`<!----> `);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="text-center group">`);
          push_element($$renderer3, "div", 60, 10);
          $$renderer3.push(`<div class="relative mb-6 overflow-hidden rounded-2xl">`);
          push_element($$renderer3, "div", 61, 12);
          $$renderer3.push(`<img src="/team/sajulga.jpg" alt="Adrian T. Sajulga" class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"/>`);
          push_element($$renderer3, "img", 62, 14);
          pop_element();
          $$renderer3.push(` <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">`);
          push_element($$renderer3, "div", 67, 14);
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">`);
          push_element($$renderer3, "h3", 71, 12);
          $$renderer3.push(`Adrian T. Sajulga</h3>`);
          pop_element();
          $$renderer3.push(` <p class="text-muted-foreground font-kollektif text-sm mb-3">`);
          push_element($$renderer3, "p", 77, 12);
          $$renderer3.push(`Co-Founder &amp; Backend Architect</p>`);
          pop_element();
          $$renderer3.push(` <p class="text-xs text-muted-foreground font-kollektif">`);
          push_element($$renderer3, "p", 80, 12);
          $$renderer3.push(`Backend specialist focused on building scalable, secure
              infrastructure for mental health services.</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, {
          y: 40,
          duration: 600,
          delay: 200,
          children
        });
      }
      $$renderer2.push(`<!----> `);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="text-center group">`);
          push_element($$renderer3, "div", 91, 10);
          $$renderer3.push(`<div class="relative mb-6 overflow-hidden rounded-2xl">`);
          push_element($$renderer3, "div", 92, 12);
          $$renderer3.push(`<img src="/team/segundo.jpg" alt="Julia Laine Segundo" class="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"/>`);
          push_element($$renderer3, "img", 93, 14);
          pop_element();
          $$renderer3.push(` <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">`);
          push_element($$renderer3, "div", 98, 14);
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h3 class="text-xl font-bold font-futura mb-2" style="color: var(--primary);">`);
          push_element($$renderer3, "h3", 102, 12);
          $$renderer3.push(`Julia Laine Segundo</h3>`);
          pop_element();
          $$renderer3.push(` <p class="text-muted-foreground font-kollektif text-sm mb-3">`);
          push_element($$renderer3, "p", 108, 12);
          $$renderer3.push(`Co-Founder &amp; AI Engineer</p>`);
          pop_element();
          $$renderer3.push(` <p class="text-xs text-muted-foreground font-kollektif">`);
          push_element($$renderer3, "p", 111, 12);
          $$renderer3.push(`Machine learning expert developing AI-powered assessment and
              evaluation systems.</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, {
          y: 40,
          duration: 600,
          delay: 300,
          children
        });
      }
      $$renderer2.push(`<!----></div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</section>`);
      pop_element();
    },
    TeamSection
  );
}
TeamSection.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
CTASection[FILENAME] = "src/lib/components/about/CTASection.svelte";
function CTASection($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      $$renderer2.push(`<section class="py-20 relative" style="background: linear-gradient(180deg, oklch(0.98 0.0464 124.31 / 0.12) 0%, oklch(0.98 0.0464 124.31 / 0.18) 100%);">`);
      push_element($$renderer2, "section", 6, 0);
      ParallaxDots($$renderer2, { variant: "green" });
      $$renderer2.push(`<!----> `);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">`);
          push_element($$renderer3, "div", 10, 6);
          $$renderer3.push(`<h2 class="text-3xl md:text-5xl font-bold font-futura mb-6" style="color: var(--primary);">`);
          push_element($$renderer3, "h2", 11, 8);
          $$renderer3.push(`Ready to Get Started?</h2>`);
          pop_element();
          $$renderer3.push(` <p class="text-xl text-muted-foreground font-kollektif mb-8">`);
          push_element($$renderer3, "p", 17, 8);
          $$renderer3.push(`Transform your organization's approach to mental health</p>`);
          pop_element();
          $$renderer3.push(` <a href="/demo" class="inline-block px-10 py-4 rounded-xl text-lg font-semibold font-kollektif transition-all hover:shadow-2xl hover:scale-105 text-white" style="background: linear-gradient(to right, var(--primary), var(--secondary));">`);
          push_element($$renderer3, "a", 20, 8);
          $$renderer3.push(`Book a Demo</a>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { y: 30, duration: 800, children });
      }
      $$renderer2.push(`<!----></section>`);
      pop_element();
    },
    CTASection
  );
}
CTASection.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
_page[FILENAME] = "src/routes/about/+page.svelte";
function _page($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      head($$renderer2, ($$renderer3) => {
        $$renderer3.title(($$renderer4) => {
          $$renderer4.push(`<title>About Us - Mentara</title>`);
        });
        $$renderer3.push(`<meta name="description" content="Learn about Mentara's mission, technology, and team dedicated to transforming mental health care."/>`);
        push_element($$renderer3, "meta", 14, 2);
        pop_element();
      });
      $$renderer2.push(`<div class="min-h-screen bg-background">`);
      push_element($$renderer2, "div", 20, 0);
      Navbar($$renderer2);
      $$renderer2.push(`<!----> <main>`);
      push_element($$renderer2, "main", 23, 2);
      HeroSection($$renderer2);
      $$renderer2.push(`<!----> `);
      EnterpriseSection($$renderer2);
      $$renderer2.push(`<!----> `);
      SecuritySection($$renderer2);
      $$renderer2.push(`<!----> `);
      AppScreenshots($$renderer2);
      $$renderer2.push(`<!----> `);
      TeamSection($$renderer2);
      $$renderer2.push(`<!----> `);
      CTASection($$renderer2);
      $$renderer2.push(`<!----></main>`);
      pop_element();
      $$renderer2.push(` `);
      Footer($$renderer2);
      $$renderer2.push(`<!----></div>`);
      pop_element();
    },
    _page
  );
}
_page.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  _page as default
};
