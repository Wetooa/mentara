import { a1 as getContext, a3 as attr_class, a6 as attr_style, a5 as stringify, aa as unsubscribe_stores, ab as store_get, Z as FILENAME } from "./index.js";
import "./client.js";
import { p as push_element, a as pop_element } from "./dev.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = get_store("page");
    return store.subscribe(fn);
  }
};
function get_store(name) {
  try {
    return getStores()[name];
  } catch {
    throw new Error(
      `Cannot subscribe to '${name}' store on the server outside of a Svelte component, as it is bound to the current request via component context. This prevents state from leaking between users.For more information, see https://svelte.dev/docs/kit/state-management#avoid-shared-state-on-the-server`
    );
  }
}
Navbar[FILENAME] = "src/lib/components/Navbar.svelte";
function Navbar($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      var $$store_subs;
      function isActive(path) {
        return store_get($$store_subs ??= {}, "$page", page).url.pathname === path;
      }
      $$renderer2.push(`<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">`);
      push_element($$renderer2, "nav", 15, 0);
      $$renderer2.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
      push_element($$renderer2, "div", 16, 2);
      $$renderer2.push(`<div class="flex justify-between items-center h-16">`);
      push_element($$renderer2, "div", 17, 4);
      $$renderer2.push(`<a href="/" class="flex items-center space-x-3">`);
      push_element($$renderer2, "a", 19, 6);
      $$renderer2.push(`<img src="/icons/mentara/mentara-icon.png" alt="Mentara" class="h-10 w-10"/>`);
      push_element($$renderer2, "img", 20, 8);
      pop_element();
      $$renderer2.push(` <div class="text-2xl font-bold" style="color: var(--primary);">`);
      push_element($$renderer2, "div", 21, 8);
      $$renderer2.push(`<span class="font-futura">`);
      push_element($$renderer2, "span", 22, 10);
      $$renderer2.push(`Mentara</span>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(`</a>`);
      pop_element();
      $$renderer2.push(` <div class="hidden md:flex items-center space-x-8">`);
      push_element($$renderer2, "div", 27, 6);
      $$renderer2.push(`<a href="/"${attr_class("relative py-2 text-foreground transition-colors font-kollektif group", void 0, { "font-semibold": isActive("/") })}>`);
      push_element($$renderer2, "a", 28, 8);
      $$renderer2.push(`<span class="group-hover:opacity-80 transition-opacity"${attr_style(`color: ${stringify(isActive("/") ? "var(--primary)" : "inherit")};`)}>`);
      push_element($$renderer2, "span", 33, 10);
      $$renderer2.push(`Home</span>`);
      pop_element();
      $$renderer2.push(` `);
      if (isActive("/")) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style="background-color: var(--primary);">`);
        push_element($$renderer2, "div", 37, 12);
        $$renderer2.push(`</div>`);
        pop_element();
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></a>`);
      pop_element();
      $$renderer2.push(` <a href="/about"${attr_class("relative py-2 text-foreground transition-colors font-kollektif group", void 0, { "font-semibold": isActive("/about") })}>`);
      push_element($$renderer2, "a", 40, 8);
      $$renderer2.push(`<span class="group-hover:opacity-80 transition-opacity"${attr_style(`color: ${stringify(isActive("/about") ? "var(--primary)" : "inherit")};`)}>`);
      push_element($$renderer2, "span", 45, 10);
      $$renderer2.push(`About</span>`);
      pop_element();
      $$renderer2.push(` `);
      if (isActive("/about")) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style="background-color: var(--primary);">`);
        push_element($$renderer2, "div", 49, 12);
        $$renderer2.push(`</div>`);
        pop_element();
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></a>`);
      pop_element();
      $$renderer2.push(` <a href="/demo" class="px-6 py-2 rounded-lg font-kollektif font-semibold transition-all hover:shadow-lg hover:scale-105" style="background: linear-gradient(to right, var(--primary), var(--secondary)); color: var(--primary-foreground);">`);
      push_element($$renderer2, "a", 52, 8);
      $$renderer2.push(`Book a Demo</a>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` <button class="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle menu">`);
      push_element($$renderer2, "button", 62, 6);
      $$renderer2.push(`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      push_element($$renderer2, "svg", 67, 8);
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16">`);
        push_element($$renderer2, "path", 81, 12);
        $$renderer2.push(`</path>`);
        pop_element();
      }
      $$renderer2.push(`<!--]--></svg>`);
      pop_element();
      $$renderer2.push(`</button>`);
      pop_element();
      $$renderer2.push(`</div>`);
      pop_element();
      $$renderer2.push(` `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
      pop_element();
      $$renderer2.push(`</nav>`);
      pop_element();
      $$renderer2.push(` <div class="h-16">`);
      push_element($$renderer2, "div", 124, 0);
      $$renderer2.push(`</div>`);
      pop_element();
      if ($$store_subs) unsubscribe_stores($$store_subs);
    },
    Navbar
  );
}
Navbar.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  Navbar as N
};
