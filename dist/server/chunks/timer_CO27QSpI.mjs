/* empty css               */
import { c as createComponent } from './astro-component_BB6JYyY2.mjs';
import 'piccolore';
import { h as addAttribute, o as renderHead, p as renderComponent, r as renderTemplate } from './server_DKuyG52f.mjs';

const $$Timer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Timer;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><title>Timer + Scores Display</title><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}>${renderHead()}</head> <body class="bg-black text-white m-0 p-0 overflow-hidden"> ${renderComponent($$result, "LegoTimerDisplay", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/displays/BigTimerDisplay", "client:component-export": "default" })} </body></html>`;
}, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/displays/timer.astro", void 0);

const $$file = "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/displays/timer.astro";
const $$url = "/displays/timer";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Timer,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
