import { a3 as attr_class, a4 as clsx, a2 as escape_html, Z as FILENAME, a5 as stringify, a0 as head, $ as prevent_snippet_stringification } from "../../chunks/index.js";
import { N as Navbar } from "../../chunks/Navbar.js";
import "../../chunks/index-client.js";
import { p as push_element, a as pop_element, v as validate_snippet_args } from "../../chunks/dev.js";
import { A as AnimateOnScroll, F as Footer } from "../../chunks/Footer.js";
CountUpNumber[FILENAME] = "src/lib/components/CountUpNumber.svelte";
function CountUpNumber($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      let { value, duration = 2e3, suffix = "", className = "" } = $$props;
      let displayValue = 0;
      function parseValue(val) {
        if (typeof val === "number") return val;
        const numMatch = val.match(/\d+/);
        return numMatch ? parseInt(numMatch[0]) : 0;
      }
      parseValue(value);
      $$renderer2.push(`<span${attr_class(clsx(className))}>`);
      push_element($$renderer2, "span", 79, 0);
      $$renderer2.push(`${escape_html(displayValue)}${escape_html(suffix)}</span>`);
      pop_element();
    },
    CountUpNumber
  );
}
CountUpNumber.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
Hero[FILENAME] = "src/lib/components/Hero.svelte";
function Hero($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      let { className = "" } = $$props;
      let isHovering = false;
      $$renderer2.push(`<section${attr_class(`relative py-20 md:py-32 overflow-hidden ${stringify(className)}`, "svelte-1q37ri0")}>`);
      push_element($$renderer2, "section", 10, 0);
      $$renderer2.push(`<div class="absolute inset-0 -z-10 svelte-1q37ri0">`);
      push_element($$renderer2, "div", 12, 2);
      $$renderer2.push(`<div class="absolute inset-0 bg-gradient-to-br from-[oklch(0.56_0.1223_127.47)]/15 via-[oklch(0.98_0.0464_124.31)]/20 to-white animate-gradient svelte-1q37ri0">`);
      push_element($$renderer2, "div", 13, 4);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse svelte-1q37ri0" style="background-color: oklch(0.56 0.1223 127.47 / 0.08);">`);
      push_element($$renderer2, "div", 16, 4);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 svelte-1q37ri0" style="background-color: oklch(0.4 0.0812 92.8 / 0.08);">`);
      push_element($$renderer2, "div", 20, 4);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 svelte-1q37ri0">`);
      push_element($$renderer2, "div", 26, 2);
      $$renderer2.push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center svelte-1q37ri0">`);
      push_element($$renderer2, "div", 27, 4);
      $$renderer2.push(`<div class="space-y-8 text-center lg:text-left svelte-1q37ri0">`);
      push_element($$renderer2, "div", 29, 6);
      $$renderer2.push(`<h1 class="text-5xl md:text-6xl lg:text-7xl font-bold font-futura leading-tight svelte-1q37ri0">`);
      push_element($$renderer2, "h1", 34, 8);
      $$renderer2.push(`<span class="block bg-gradient-to-r bg-clip-text text-transparent svelte-1q37ri0" style="background-image: linear-gradient(to right, var(--primary), var(--secondary));">`);
      push_element($$renderer2, "span", 38, 10);
      $$renderer2.push(`Empowering Minds,</span>`);
      pop_element();
      $$renderer2.push(` <span class="block text-foreground mt-2 svelte-1q37ri0">`);
      push_element($$renderer2, "span", 44, 10);
      $$renderer2.push(`Transforming Lives</span>`);
      pop_element();
      $$renderer2.push(`</h1>`);
      pop_element();
      $$renderer2.push(` <p class="text-xl md:text-2xl text-muted-foreground font-kollektif max-w-2xl mx-auto lg:mx-0 svelte-1q37ri0">`);
      push_element($$renderer2, "p", 48, 8);
      $$renderer2.push(`Crafting Safe Spaces Through Data-Driven Mental Health Solutions</p>`);
      pop_element();
      $$renderer2.push(` <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4 svelte-1q37ri0">`);
      push_element($$renderer2, "div", 56, 8);
      $$renderer2.push(`<a href="/demo" class="group px-8 py-4 rounded-xl text-lg font-semibold font-kollektif transition-all hover:shadow-2xl hover:scale-105 text-white relative overflow-hidden svelte-1q37ri0" style="background: linear-gradient(to right, var(--primary), var(--secondary));">`);
      push_element($$renderer2, "a", 60, 10);
      $$renderer2.push(`<span class="relative z-10 svelte-1q37ri0">`);
      push_element($$renderer2, "span", 65, 12);
      $$renderer2.push(`Book a Demo</span>`);
      pop_element();
      $$renderer2.push(` <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity svelte-1q37ri0" style="background: linear-gradient(to right, var(--secondary), var(--primary));">`);
      push_element($$renderer2, "div", 66, 12);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</a>`);
      pop_element();
      $$renderer2.push(` <a href="/about" class="px-8 py-4 rounded-xl text-lg font-semibold font-kollektif border-2 transition-all svelte-1q37ri0" style="border-color: var(--primary); color: var(--primary);">`);
      push_element($$renderer2, "a", 71, 10);
      $$renderer2.push(`Learn More</a>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="grid grid-cols-3 gap-4 pt-8 svelte-1q37ri0">`);
      push_element($$renderer2, "div", 81, 8);
      $$renderer2.push(`<div class="text-center lg:text-left svelte-1q37ri0">`);
      push_element($$renderer2, "div", 85, 10);
      $$renderer2.push(`<div class="text-4xl font-bold font-futura svelte-1q37ri0" style="color: var(--primary);">`);
      push_element($$renderer2, "div", 86, 12);
      $$renderer2.push(`24/7</div>`);
      pop_element();
      $$renderer2.push(` <p class="text-sm text-muted-foreground font-kollektif svelte-1q37ri0">`);
      push_element($$renderer2, "p", 92, 12);
      $$renderer2.push(`Available</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-center lg:text-left svelte-1q37ri0">`);
      push_element($$renderer2, "div", 96, 10);
      $$renderer2.push(`<div class="text-4xl font-bold font-futura svelte-1q37ri0" style="color: var(--primary);">`);
      push_element($$renderer2, "div", 97, 12);
      CountUpNumber($$renderer2, { value: 100, suffix: "+" });
      $$renderer2.push(`<!----></div>`);
      pop_element();
      $$renderer2.push(` <p class="text-sm text-muted-foreground font-kollektif svelte-1q37ri0">`);
      push_element($$renderer2, "p", 103, 12);
      $$renderer2.push(`Therapists</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="text-center lg:text-left svelte-1q37ri0">`);
      push_element($$renderer2, "div", 107, 10);
      $$renderer2.push(`<div class="text-4xl font-bold font-futura svelte-1q37ri0" style="color: var(--primary);">`);
      push_element($$renderer2, "div", 108, 12);
      CountUpNumber($$renderer2, { value: 10, suffix: "k+" });
      $$renderer2.push(`<!----></div>`);
      pop_element();
      $$renderer2.push(` <p class="text-sm text-muted-foreground font-kollektif svelte-1q37ri0">`);
      push_element($$renderer2, "p", 114, 12);
      $$renderer2.push(`Lives Helped</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="relative svelte-1q37ri0">`);
      push_element($$renderer2, "div", 122, 6);
      $$renderer2.push(`<div${attr_class("relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 cursor-pointer svelte-1q37ri0", void 0, { "scale-105": isHovering })}>`);
      push_element($$renderer2, "div", 126, 8);
      $$renderer2.push(`<img src="/woman-flower-crown.png" alt="Mental health and wellness - woman with flowers" class="w-full h-auto object-cover svelte-1q37ri0"/>`);
      push_element($$renderer2, "img", 133, 10);
      pop_element();
      $$renderer2.push(` <div class="absolute inset-0 bg-gradient-to-t to-transparent svelte-1q37ri0" style="background: linear-gradient(to top, oklch(0.4 0.0812 92.8 / 0.4), transparent);">`);
      push_element($$renderer2, "div", 138, 10);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg svelte-1q37ri0">`);
      push_element($$renderer2, "div", 144, 10);
      $$renderer2.push(`<p class="text-sm font-kollektif font-semibold svelte-1q37ri0" style="color: var(--primary);">`);
      push_element($$renderer2, "p", 148, 12);
      $$renderer2.push(`✨ Join organizations transforming workplace mental health</p>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-xl svelte-1q37ri0" style="background-color: var(--primary); opacity: 0.15;">`);
      push_element($$renderer2, "div", 158, 8);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-xl svelte-1q37ri0" style="background-color: var(--secondary); opacity: 0.15;">`);
      push_element($$renderer2, "div", 163, 8);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</section>`);
      pop_element();
    },
    Hero
  );
}
Hero.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
_page[FILENAME] = "src/routes/+page.svelte";
function _page($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      head($$renderer2, ($$renderer3) => {
        $$renderer3.title(($$renderer4) => {
          $$renderer4.push(`<title>Mentara - Empowering Minds, Transforming Lives</title>`);
        });
        $$renderer3.push(`<meta name="description" content="Mentara provides data-driven mental health solutions with 24/7 access to licensed therapists and comprehensive mental health resources."/>`);
        push_element($$renderer3, "meta", 10, 2);
        pop_element();
      });
      $$renderer2.push(`<div class="min-h-screen bg-background">`);
      push_element($$renderer2, "div", 16, 0);
      Navbar($$renderer2);
      $$renderer2.push(`<!----> <main>`);
      push_element($$renderer2, "main", 19, 2);
      Hero($$renderer2, {});
      $$renderer2.push(`<!----> <section class="py-20 relative">`);
      push_element($$renderer2, "section", 23, 4);
      $$renderer2.push(`<div class="absolute inset-0 -z-10">`);
      push_element($$renderer2, "div", 25, 6);
      $$renderer2.push(`<div class="absolute inset-0 bg-gradient-to-b from-white via-[oklch(0.98_0.0464_124.31)]/10 to-white">`);
      push_element($$renderer2, "div", 26, 8);
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 30, 6);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="text-center mb-16">`);
          push_element($$renderer3, "div", 33, 12);
          {
            let children2 = function($$renderer4) {
              validate_snippet_args($$renderer4);
              $$renderer4.push(`<div class="inline-block px-4 py-2 rounded-full mb-4" style="background-color: oklch(0.98 0.0464 124.31);">`);
              push_element($$renderer4, "div", 36, 18);
              $$renderer4.push(`<span class="font-semibold font-kollektif text-sm" style="color: var(--primary);">`);
              push_element($$renderer4, "span", 40, 20);
              $$renderer4.push(`Why Choose Mentara</span>`);
              pop_element();
              $$renderer4.push(`</div>`);
              pop_element();
            };
            prevent_snippet_stringification(children2);
            AnimateOnScroll($$renderer3, {
              scaleAmount: 0.8,
              duration: 500,
              delay: 200,
              children: children2
            });
          }
          $$renderer3.push(`<!----> `);
          {
            let children2 = function($$renderer4) {
              validate_snippet_args($$renderer4);
              $$renderer4.push(`<h2 class="text-4xl md:text-5xl font-bold font-futura mb-4 bg-gradient-to-r bg-clip-text text-transparent" style="background-image: linear-gradient(to right, var(--primary), var(--secondary));">`);
              push_element($$renderer4, "h2", 49, 18);
              $$renderer4.push(`Our Approach</h2>`);
              pop_element();
            };
            prevent_snippet_stringification(children2);
            AnimateOnScroll($$renderer3, {
              y: 20,
              duration: 600,
              delay: 300,
              children: children2
            });
          }
          $$renderer3.push(`<!----> `);
          {
            let children2 = function($$renderer4) {
              validate_snippet_args($$renderer4);
              $$renderer4.push(`<p class="text-xl text-muted-foreground font-kollektif max-w-2xl mx-auto">`);
              push_element($$renderer4, "p", 59, 18);
              $$renderer4.push(`A comprehensive mental health solution tailored to your
                    needs</p>`);
              pop_element();
            };
            prevent_snippet_stringification(children2);
            AnimateOnScroll($$renderer3, {
              y: 20,
              duration: 600,
              delay: 400,
              children: children2
            });
          }
          $$renderer3.push(`<!----></div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, { y: 30, duration: 600, children });
      }
      $$renderer2.push(`<!----> <div class="grid grid-cols-1 md:grid-cols-3 gap-8">`);
      push_element($$renderer2, "div", 71, 8);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="group p-8 rounded-2xl bg-gradient-to-br border-2 hover:shadow-2xl hover:-translate-y-2 transition-all" style="background: linear-gradient(135deg, oklch(from var(--primary) l c h / 0.1) 0%, white 100%); border-color: var(--primary); border-opacity: 0.2;">`);
          push_element($$renderer3, "div", 75, 14);
          $$renderer3.push(`<div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style="background: linear-gradient(135deg, var(--primary), var(--secondary));">`);
          push_element($$renderer3, "div", 79, 16);
          $$renderer3.push(`<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
          push_element($$renderer3, "svg", 83, 18);
          $$renderer3.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">`);
          push_element($$renderer3, "path", 89, 20);
          $$renderer3.push(`</path>`);
          pop_element();
          $$renderer3.push(`</svg>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h3 class="text-2xl font-bold font-futura mb-3" style="color: var(--primary);">`);
          push_element($$renderer3, "h3", 97, 16);
          $$renderer3.push(`Education &amp; Awareness</h3>`);
          pop_element();
          $$renderer3.push(` <p class="font-kollektif leading-relaxed" style="color: var(--secondary);">`);
          push_element($$renderer3, "p", 103, 16);
          $$renderer3.push(`Reducing stigma and normalizing mental health through
                  comprehensive resources and tools for personal development.</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, {
          y: 50,
          duration: 600,
          delay: 100,
          children
        });
      }
      $$renderer2.push(`<!----> `);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="group p-8 rounded-2xl bg-gradient-to-br border-2 hover:shadow-2xl hover:-translate-y-2 transition-all" style="background: linear-gradient(135deg, oklch(from var(--primary) l c h / 0.1) 0%, white 100%); border-color: var(--primary); border-opacity: 0.2;">`);
          push_element($$renderer3, "div", 117, 14);
          $$renderer3.push(`<div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style="background: linear-gradient(135deg, var(--primary), var(--secondary));">`);
          push_element($$renderer3, "div", 121, 16);
          $$renderer3.push(`<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
          push_element($$renderer3, "svg", 125, 18);
          $$renderer3.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">`);
          push_element($$renderer3, "path", 131, 20);
          $$renderer3.push(`</path>`);
          pop_element();
          $$renderer3.push(`</svg>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h3 class="text-2xl font-bold font-futura mb-3" style="color: var(--primary);">`);
          push_element($$renderer3, "h3", 139, 16);
          $$renderer3.push(`Data-Driven Approach</h3>`);
          pop_element();
          $$renderer3.push(` <p class="font-kollektif leading-relaxed" style="color: var(--secondary);">`);
          push_element($$renderer3, "p", 145, 16);
          $$renderer3.push(`Enabling AI-matching and standardized pre-assessment for
                  personalized mental health support.</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, {
          y: 50,
          duration: 600,
          delay: 200,
          children
        });
      }
      $$renderer2.push(`<!----> `);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="group p-8 rounded-2xl bg-gradient-to-br border-2 hover:shadow-2xl hover:-translate-y-2 transition-all" style="background: linear-gradient(135deg, oklch(from var(--primary) l c h / 0.1) 0%, white 100%); border-color: var(--primary); border-opacity: 0.2;">`);
          push_element($$renderer3, "div", 159, 14);
          $$renderer3.push(`<div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style="background: linear-gradient(135deg, var(--primary), var(--secondary));">`);
          push_element($$renderer3, "div", 163, 16);
          $$renderer3.push(`<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
          push_element($$renderer3, "svg", 167, 18);
          $$renderer3.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">`);
          push_element($$renderer3, "path", 173, 20);
          $$renderer3.push(`</path>`);
          pop_element();
          $$renderer3.push(`</svg>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
          $$renderer3.push(` <h3 class="text-2xl font-bold font-futura mb-3" style="color: var(--primary);">`);
          push_element($$renderer3, "h3", 181, 16);
          $$renderer3.push(`Convenient Access</h3>`);
          pop_element();
          $$renderer3.push(` <p class="font-kollektif leading-relaxed" style="color: var(--secondary);">`);
          push_element($$renderer3, "p", 187, 16);
          $$renderer3.push(`24/7 access to mental health resources, talk therapy
                  scheduling, and coaching in one seamless ecosystem.</p>`);
          pop_element();
          $$renderer3.push(`</div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, {
          y: 50,
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
      $$renderer2.push(` <section class="py-20">`);
      push_element($$renderer2, "section", 202, 4);
      {
        let children = function($$renderer3) {
          validate_snippet_args($$renderer3);
          $$renderer3.push(`<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">`);
          push_element($$renderer3, "div", 205, 10);
          {
            let children2 = function($$renderer4) {
              validate_snippet_args($$renderer4);
              $$renderer4.push(`<h2 class="text-3xl md:text-5xl font-bold font-futura mb-6 bg-gradient-to-r bg-clip-text text-transparent" style="background-image: linear-gradient(to right, var(--primary), var(--secondary));">`);
              push_element($$renderer4, "h2", 208, 16);
              $$renderer4.push(`Ready to Transform Your Organization?</h2>`);
              pop_element();
            };
            prevent_snippet_stringification(children2);
            AnimateOnScroll($$renderer3, {
              y: 30,
              duration: 600,
              delay: 200,
              children: children2
            });
          }
          $$renderer3.push(`<!----> `);
          {
            let children2 = function($$renderer4) {
              validate_snippet_args($$renderer4);
              $$renderer4.push(`<p class="text-xl text-muted-foreground font-kollektif mb-8">`);
              push_element($$renderer4, "p", 218, 16);
              $$renderer4.push(`Book a demo to see how Mentara can help create a mentally
                  healthy workplace</p>`);
              pop_element();
            };
            prevent_snippet_stringification(children2);
            AnimateOnScroll($$renderer3, {
              y: 20,
              duration: 600,
              delay: 400,
              children: children2
            });
          }
          $$renderer3.push(`<!----> `);
          {
            let children2 = function($$renderer4) {
              validate_snippet_args($$renderer4);
              $$renderer4.push(`<a href="/demo" class="inline-block px-10 py-4 rounded-xl text-xl font-semibold font-kollektif transition-all shadow-xl hover:scale-105 text-white" style="background: linear-gradient(to right, var(--primary), var(--secondary));">`);
              push_element($$renderer4, "a", 226, 16);
              $$renderer4.push(`Book a Demo</a>`);
              pop_element();
            };
            prevent_snippet_stringification(children2);
            AnimateOnScroll($$renderer3, {
              y: 20,
              duration: 600,
              delay: 600,
              children: children2
            });
          }
          $$renderer3.push(`<!----></div>`);
          pop_element();
        };
        prevent_snippet_stringification(children);
        AnimateOnScroll($$renderer2, {
          scaleAmount: 0.95,
          duration: 800,
          children
        });
      }
      $$renderer2.push(`<!----></section>`);
      pop_element();
      $$renderer2.push(`</main>`);
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
