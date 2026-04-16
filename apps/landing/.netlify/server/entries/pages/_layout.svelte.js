import { a0 as head, Z as FILENAME } from "../../chunks/index.js";
import { p as push_element, a as pop_element } from "../../chunks/dev.js";
_layout[FILENAME] = "src/routes/+layout.svelte";
function _layout($$renderer, $$props) {
  $$renderer.component(
    ($$renderer2) => {
      let { children } = $$props;
      head($$renderer2, ($$renderer3) => {
        $$renderer3.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0"/>`);
        push_element($$renderer3, "meta", 8, 1);
        pop_element();
      });
      children?.($$renderer2);
      $$renderer2.push(`<!---->`);
    },
    _layout
  );
}
_layout.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  _layout as default
};
