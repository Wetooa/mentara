import { a0 as head, a8 as attr, a2 as escape_html, Z as FILENAME } from "../../../chunks/index.js";
import { N as Navbar } from "../../../chunks/Navbar.js";
import { p as push_element, a as pop_element } from "../../../chunks/dev.js";
_page[FILENAME] = "src/routes/demo/+page.svelte";
function _page($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      let formData = {
        firstName: "",
        lastName: "",
        companyName: "",
        jobTitle: "",
        email: "",
        contactNumber: "",
        companySize: "",
        message: ""
      };
      let isSubmitting = false;
      head($$renderer2, ($$renderer3) => {
        $$renderer3.title(($$renderer4) => {
          $$renderer4.push(`<title>Book a Demo - Mentara</title>`);
        });
        $$renderer3.push(`<meta name="description" content="Book a demo to see how Mentara can transform your organization's mental health approach."/>`);
        push_element($$renderer3, "meta", 118, 2);
        pop_element();
      });
      $$renderer2.push(`<div class="min-h-screen bg-background">`);
      push_element($$renderer2, "div", 124, 0);
      Navbar($$renderer2);
      $$renderer2.push(`<!----> <main class="py-0 md:py-8 lg:px-8 lg:pb-8">`);
      push_element($$renderer2, "main", 127, 2);
      $$renderer2.push(`<div class="max-w-7xl mx-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-8rem)]">`);
      push_element($$renderer2, "div", 128, 4);
      $$renderer2.push(`<div class="grid grid-cols-1 lg:grid-cols-2 h-full lg:rounded-3xl lg:shadow-2xl overflow-hidden lg:border lg:border-border">`);
      push_element($$renderer2, "div", 130, 6);
      $$renderer2.push(`<div class="relative hidden lg:block bg-gradient-to-br overflow-hidden" style="background: linear-gradient(135deg, var(--primary), var(--secondary));">`);
      push_element($$renderer2, "div", 134, 8);
      $$renderer2.push(`<div class="absolute inset-0">`);
      push_element($$renderer2, "div", 138, 10);
      $$renderer2.push(`<img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&amp;h=1000&amp;fit=crop" alt="Professional team in modern corporate office" class="w-full h-full object-cover opacity-30 mix-blend-overlay"/>`);
      push_element($$renderer2, "img", 139, 12);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="relative z-10 flex flex-col justify-between h-full p-12 text-white">`);
      push_element($$renderer2, "div", 147, 10);
      $$renderer2.push(`<div class="space-y-6">`);
      push_element($$renderer2, "div", 151, 12);
      $$renderer2.push(`<div class="inline-block">`);
      push_element($$renderer2, "div", 152, 14);
      $$renderer2.push(`<img src="/icons/mentara/mentara-with-text.png" alt="Mentara" class="h-12 brightness-0 invert"/>`);
      push_element($$renderer2, "img", 153, 16);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <h2 class="text-4xl font-bold font-futura leading-tight">`);
      push_element($$renderer2, "h2", 159, 14);
      $$renderer2.push(`Transform Your Organization's Mental Health</h2>`);
      pop_element();
      $$renderer2.push(` <p class="text-xl font-kollektif text-white/90 leading-relaxed">`);
      push_element($$renderer2, "p", 162, 14);
      $$renderer2.push(`Join leading organizations in creating a mentally healthy
                workplace with data-driven insights and 24/7 support.</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="space-y-6">`);
      push_element($$renderer2, "div", 169, 12);
      $$renderer2.push(`<div class="grid grid-cols-2 gap-6">`);
      push_element($$renderer2, "div", 170, 14);
      $$renderer2.push(`<div class="flex items-start space-x-3">`);
      push_element($$renderer2, "div", 171, 16);
      $$renderer2.push(`<svg class="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 172, 18);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">`);
      push_element($$renderer2, "path", 178, 20);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 185, 18);
      $$renderer2.push(`<div class="font-semibold font-kollektif">`);
      push_element($$renderer2, "div", 186, 20);
      $$renderer2.push(`24/7 Access</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-sm text-white/80">`);
      push_element($$renderer2, "div", 187, 20);
      $$renderer2.push(`Always available</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="flex items-start space-x-3">`);
      push_element($$renderer2, "div", 190, 16);
      $$renderer2.push(`<svg class="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 191, 18);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">`);
      push_element($$renderer2, "path", 197, 20);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 204, 18);
      $$renderer2.push(`<div class="font-semibold font-kollektif">`);
      push_element($$renderer2, "div", 205, 20);
      $$renderer2.push(`100+ Therapists</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-sm text-white/80">`);
      push_element($$renderer2, "div", 208, 20);
      $$renderer2.push(`Licensed professionals</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="flex items-start space-x-3">`);
      push_element($$renderer2, "div", 213, 16);
      $$renderer2.push(`<svg class="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 214, 18);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">`);
      push_element($$renderer2, "path", 220, 20);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 227, 18);
      $$renderer2.push(`<div class="font-semibold font-kollektif">`);
      push_element($$renderer2, "div", 228, 20);
      $$renderer2.push(`Data-Driven</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-sm text-white/80">`);
      push_element($$renderer2, "div", 229, 20);
      $$renderer2.push(`Insights &amp; analytics</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="flex items-start space-x-3">`);
      push_element($$renderer2, "div", 234, 16);
      $$renderer2.push(`<svg class="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 235, 18);
      $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">`);
      push_element($$renderer2, "path", 241, 20);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 248, 18);
      $$renderer2.push(`<div class="font-semibold font-kollektif">`);
      push_element($$renderer2, "div", 249, 20);
      $$renderer2.push(`Trusted by 500+</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-sm text-white/80">`);
      push_element($$renderer2, "div", 252, 20);
      $$renderer2.push(`Organizations</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="pt-6 border-t border-white/20">`);
      push_element($$renderer2, "div", 257, 14);
      $$renderer2.push(`<p class="text-sm text-white/70 font-kollektif">`);
      push_element($$renderer2, "p", 258, 16);
      $$renderer2.push(`"Mentara has transformed how we approach employee mental
                  health. The platform is intuitive and our team loves it."</p>`);
      pop_element();
      $$renderer2.push(` <p class="text-sm text-white/90 font-semibold mt-2">`);
      push_element($$renderer2, "p", 262, 16);
      $$renderer2.push(`— HR Director, Fortune 500 Company</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="bg-white overflow-y-auto">`);
      push_element($$renderer2, "div", 271, 8);
      $$renderer2.push(`<div class="p-6 md:p-8 lg:p-10 h-full flex flex-col">`);
      push_element($$renderer2, "div", 272, 10);
      $$renderer2.push(`<div class="mb-8">`);
      push_element($$renderer2, "div", 274, 12);
      $$renderer2.push(`<div class="inline-block px-3 py-1 rounded-full mb-4" style="background-color: oklch(0.98 0.0464 124.31);">`);
      push_element($$renderer2, "div", 275, 14);
      $$renderer2.push(`<span class="text-sm font-semibold font-kollektif" style="color: var(--primary);">`);
      push_element($$renderer2, "span", 279, 16);
      $$renderer2.push(`Let's Connect</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <h1 class="text-3xl md:text-4xl font-bold font-futura mb-3" style="color: var(--primary);">`);
      push_element($$renderer2, "h1", 284, 14);
      $$renderer2.push(`Book Your Demo</h1>`);
      pop_element();
      $$renderer2.push(` <p class="text-lg text-muted-foreground font-kollektif">`);
      push_element($$renderer2, "p", 290, 14);
      $$renderer2.push(`Fill out the form below and we'll get back to you within 24
                hours</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <form class="space-y-6">`);
      push_element($$renderer2, "form", 297, 12);
      $$renderer2.push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`);
      push_element($$renderer2, "div", 299, 14);
      $$renderer2.push(`<div>`);
      push_element($$renderer2, "div", 300, 16);
      $$renderer2.push(`<label for="firstName" class="block text-xs font-semibold font-kollektif mb-1" style="color: var(--foreground);">`);
      push_element($$renderer2, "label", 301, 18);
      $$renderer2.push(`First Name <span class="text-destructive">`);
      push_element($$renderer2, "span", 306, 31);
      $$renderer2.push(`*</span>`);
      pop_element();
      $$renderer2.push(`</label>`);
      pop_element();
      $$renderer2.push(` <input type="text" id="firstName"${attr("value", formData.firstName)} required class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all" placeholder="John"/>`);
      push_element($$renderer2, "input", 308, 18);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 318, 16);
      $$renderer2.push(`<label for="lastName" class="block text-xs font-semibold font-kollektif mb-1" style="color: var(--foreground);">`);
      push_element($$renderer2, "label", 319, 18);
      $$renderer2.push(`Last Name <span class="text-destructive">`);
      push_element($$renderer2, "span", 324, 30);
      $$renderer2.push(`*</span>`);
      pop_element();
      $$renderer2.push(`</label>`);
      pop_element();
      $$renderer2.push(` <input type="text" id="lastName"${attr("value", formData.lastName)} required class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all" placeholder="Doe"/>`);
      push_element($$renderer2, "input", 326, 18);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 338, 14);
      $$renderer2.push(`<label for="companyName" class="block text-xs font-semibold font-kollektif mb-1" style="color: var(--foreground);">`);
      push_element($$renderer2, "label", 339, 16);
      $$renderer2.push(`Company Name <span class="text-destructive">`);
      push_element($$renderer2, "span", 344, 31);
      $$renderer2.push(`*</span>`);
      pop_element();
      $$renderer2.push(`</label>`);
      pop_element();
      $$renderer2.push(` <input type="text" id="companyName"${attr("value", formData.companyName)} required class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all" placeholder="Acme Corporation"/>`);
      push_element($$renderer2, "input", 346, 16);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 357, 14);
      $$renderer2.push(`<label for="jobTitle" class="block text-xs font-semibold font-kollektif mb-1" style="color: var(--foreground);">`);
      push_element($$renderer2, "label", 358, 16);
      $$renderer2.push(`Job Title <span class="text-destructive">`);
      push_element($$renderer2, "span", 363, 28);
      $$renderer2.push(`*</span>`);
      pop_element();
      $$renderer2.push(`</label>`);
      pop_element();
      $$renderer2.push(` <input type="text" id="jobTitle"${attr("value", formData.jobTitle)} required class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all" placeholder="HR Manager"/>`);
      push_element($$renderer2, "input", 365, 16);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 376, 14);
      $$renderer2.push(`<label for="email" class="block text-xs font-semibold font-kollektif mb-1" style="color: var(--foreground);">`);
      push_element($$renderer2, "label", 377, 16);
      $$renderer2.push(`Email Address <span class="text-destructive">`);
      push_element($$renderer2, "span", 382, 32);
      $$renderer2.push(`*</span>`);
      pop_element();
      $$renderer2.push(`</label>`);
      pop_element();
      $$renderer2.push(` <input type="email" id="email"${attr("value", formData.email)} required class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all" placeholder="john.doe@company.com"/>`);
      push_element($$renderer2, "input", 384, 16);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 395, 14);
      $$renderer2.push(`<label for="contactNumber" class="block text-xs font-semibold font-kollektif mb-1" style="color: var(--foreground);">`);
      push_element($$renderer2, "label", 396, 16);
      $$renderer2.push(`Contact Number <span class="text-destructive">`);
      push_element($$renderer2, "span", 401, 33);
      $$renderer2.push(`*</span>`);
      pop_element();
      $$renderer2.push(`</label>`);
      pop_element();
      $$renderer2.push(` <input type="tel" id="contactNumber"${attr("value", formData.contactNumber)} required class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all" placeholder="+63 912 345 6789"/>`);
      push_element($$renderer2, "input", 403, 16);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 414, 14);
      $$renderer2.push(`<label for="companySize" class="block text-xs font-semibold font-kollektif mb-1" style="color: var(--foreground);">`);
      push_element($$renderer2, "label", 415, 16);
      $$renderer2.push(`Company Size</label>`);
      pop_element();
      $$renderer2.push(` `);
      $$renderer2.select(
        {
          id: "companySize",
          value: formData.companySize,
          class: "w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Select company size`);
          });
          $$renderer3.option({ value: "1-10" }, ($$renderer4) => {
            $$renderer4.push(`1-10 employees`);
          });
          $$renderer3.option({ value: "11-50" }, ($$renderer4) => {
            $$renderer4.push(`11-50 employees`);
          });
          $$renderer3.option({ value: "51-200" }, ($$renderer4) => {
            $$renderer4.push(`51-200 employees`);
          });
          $$renderer3.option({ value: "201-500" }, ($$renderer4) => {
            $$renderer4.push(`201-500 employees`);
          });
          $$renderer3.option({ value: "501-1000" }, ($$renderer4) => {
            $$renderer4.push(`501-1000 employees`);
          });
          $$renderer3.option({ value: "1000+" }, ($$renderer4) => {
            $$renderer4.push(`1000+ employees`);
          });
        }
      );
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 438, 14);
      $$renderer2.push(`<label for="message" class="block text-xs font-semibold font-kollektif mb-1" style="color: var(--foreground);">`);
      push_element($$renderer2, "label", 439, 16);
      $$renderer2.push(`Additional Information</label>`);
      pop_element();
      $$renderer2.push(` <textarea id="message" rows="3" class="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-kollektif transition-all resize-none" placeholder="Tell us more about your needs...">`);
      push_element($$renderer2, "textarea", 446, 16);
      const $$body = escape_html(formData.message);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <button type="submit"${attr("disabled", isSubmitting, true)} class="w-full py-3 text-sm rounded-lg font-semibold font-kollektif transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" style="background: linear-gradient(to right, var(--primary), var(--secondary)); color: var(--primary-foreground);">`);
      push_element($$renderer2, "button", 467, 14);
      $$renderer2.push(`${escape_html("Submit Demo Request")}</button>`);
      pop_element();
      $$renderer2.push(`</form>`);
      pop_element();
      $$renderer2.push(` <div class="mt-8 text-center">`);
      push_element($$renderer2, "div", 478, 12);
      $$renderer2.push(`<p class="text-muted-foreground font-kollektif text-sm">`);
      push_element($$renderer2, "p", 479, 14);
      $$renderer2.push(`We'll get back to you within 24 hours to schedule your
                personalized demo.</p>`);
      pop_element();
      $$renderer2.push(` `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</main>`);
      pop_element();
      $$renderer2.push(`</div>`);
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
