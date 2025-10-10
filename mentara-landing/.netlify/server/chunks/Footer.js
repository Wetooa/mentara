import { a3 as attr_class, Z as FILENAME, a2 as escape_html } from "./index.js";
import { p as push_element, a as pop_element } from "./dev.js";
import "./index-client.js";
AnimateOnScroll[FILENAME] = "src/lib/components/AnimateOnScroll.svelte";
function AnimateOnScroll($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      let {
        children,
        delay = 0,
        duration = 600,
        y = 30,
        x = 0,
        scaleAmount = 1,
        once = true,
        className = ""
      } = $$props;
      $$renderer2.push(`<div${attr_class(className + " overflow-visible")}>`);
      push_element($$renderer2, "div", 57, 0);
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div style="opacity: 0;">`);
        push_element($$renderer2, "div", 63, 4);
        children($$renderer2);
        $$renderer2.push(`<!----></div>`);
        pop_element();
      }
      $$renderer2.push(`<!--]--></div>`);
      pop_element();
    },
    AnimateOnScroll
  );
}
AnimateOnScroll.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
Footer[FILENAME] = "src/lib/components/Footer.svelte";
function Footer($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      $$renderer2.push(`<footer class="py-12 border-t border-border bg-gradient-to-b from-white to-[oklch(0.98_0.0464_124.31)]/20">`);
      push_element($$renderer2, "footer", 1, 0);
      $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 2, 2);
      $$renderer2.push(`<div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">`);
      push_element($$renderer2, "div", 3, 4);
      $$renderer2.push(`<div class="md:col-span-2">`);
      push_element($$renderer2, "div", 5, 6);
      $$renderer2.push(`<div class="flex items-center space-x-3 mb-4">`);
      push_element($$renderer2, "div", 6, 8);
      $$renderer2.push(`<img src="/icons/mentara/mentara-icon.png" alt="Mentara" class="h-10 w-10"/>`);
      push_element($$renderer2, "img", 7, 10);
      pop_element();
      $$renderer2.push(` <div class="text-2xl font-bold font-futura" style="color: var(--primary);">`);
      push_element($$renderer2, "div", 8, 10);
      $$renderer2.push(`Mentara</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <p class="text-muted-foreground font-kollektif mb-4 max-w-sm">`);
      push_element($$renderer2, "p", 12, 8);
      $$renderer2.push(`Empowering Minds, Transforming Lives through data-driven mental health solutions.</p>`);
      pop_element();
      $$renderer2.push(` <div class="flex space-x-4">`);
      push_element($$renderer2, "div", 15, 8);
      $$renderer2.push(`<a href="#" class="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style="background-color: var(--primary);">`);
      push_element($$renderer2, "a", 17, 10);
      $$renderer2.push(`<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 18, 12);
      $$renderer2.push(`<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z">`);
      push_element($$renderer2, "path", 19, 14);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(`</a>`);
      pop_element();
      $$renderer2.push(` <a href="#" class="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style="background-color: var(--primary);">`);
      push_element($$renderer2, "a", 22, 10);
      $$renderer2.push(`<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 23, 12);
      $$renderer2.push(`<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z">`);
      push_element($$renderer2, "path", 24, 14);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(`</a>`);
      pop_element();
      $$renderer2.push(` <a href="#" class="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style="background-color: var(--primary);">`);
      push_element($$renderer2, "a", 27, 10);
      $$renderer2.push(`<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 28, 12);
      $$renderer2.push(`<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z">`);
      push_element($$renderer2, "path", 29, 14);
      $$renderer2.push(`</path>`);
      pop_element();
      $$renderer2.push(`</svg>`);
      pop_element();
      $$renderer2.push(`</a>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 36, 6);
      $$renderer2.push(`<h3 class="font-semibold font-futura mb-4" style="color: var(--primary);">`);
      push_element($$renderer2, "h3", 37, 8);
      $$renderer2.push(`Quick Links</h3>`);
      pop_element();
      $$renderer2.push(` <ul class="space-y-2 font-kollektif text-muted-foreground">`);
      push_element($$renderer2, "ul", 38, 8);
      $$renderer2.push(`<li>`);
      push_element($$renderer2, "li", 39, 10);
      $$renderer2.push(`<a href="/" class="hover:text-primary transition-colors">`);
      push_element($$renderer2, "a", 39, 14);
      $$renderer2.push(`Home</a>`);
      pop_element();
      $$renderer2.push(`</li>`);
      pop_element();
      $$renderer2.push(` <li>`);
      push_element($$renderer2, "li", 40, 10);
      $$renderer2.push(`<a href="/about" class="hover:text-primary transition-colors">`);
      push_element($$renderer2, "a", 40, 14);
      $$renderer2.push(`About Us</a>`);
      pop_element();
      $$renderer2.push(`</li>`);
      pop_element();
      $$renderer2.push(` <li>`);
      push_element($$renderer2, "li", 41, 10);
      $$renderer2.push(`<a href="/demo" class="hover:text-primary transition-colors">`);
      push_element($$renderer2, "a", 41, 14);
      $$renderer2.push(`Book a Demo</a>`);
      pop_element();
      $$renderer2.push(`</li>`);
      pop_element();
      $$renderer2.push(`</ul>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div>`);
      push_element($$renderer2, "div", 46, 6);
      $$renderer2.push(`<h3 class="font-semibold font-futura mb-4" style="color: var(--primary);">`);
      push_element($$renderer2, "h3", 47, 8);
      $$renderer2.push(`Contact</h3>`);
      pop_element();
      $$renderer2.push(` <ul class="space-y-2 font-kollektif text-muted-foreground text-sm">`);
      push_element($$renderer2, "ul", 48, 8);
      $$renderer2.push(`<li>`);
      push_element($$renderer2, "li", 49, 10);
      $$renderer2.push(`Email: hello@mentara.com</li>`);
      pop_element();
      $$renderer2.push(` <li>`);
      push_element($$renderer2, "li", 50, 10);
      $$renderer2.push(`Phone: +63 (02) 8123 4567</li>`);
      pop_element();
      $$renderer2.push(` <li>`);
      push_element($$renderer2, "li", 51, 10);
      $$renderer2.push(`Manila, Philippines</li>`);
      pop_element();
      $$renderer2.push(`</ul>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="pt-8 border-t border-border text-center">`);
      push_element($$renderer2, "div", 57, 4);
      $$renderer2.push(`<p class="text-sm text-muted-foreground font-kollektif">`);
      push_element($$renderer2, "p", 58, 6);
      $$renderer2.push(`© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Mentara. All rights reserved. | Empowering Minds, Transforming Lives</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</footer>`);
      pop_element();
    },
    Footer
  );
}
Footer.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  AnimateOnScroll as A,
  Footer as F
};
