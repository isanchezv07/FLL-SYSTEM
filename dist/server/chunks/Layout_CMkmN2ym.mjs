import { c as createComponent } from './astro-component_BB6JYyY2.mjs';
import 'piccolore';
import { h as addAttribute, o as renderHead, q as renderSlot, r as renderTemplate } from './server_DKuyG52f.mjs';
import 'clsx';

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="FTC Local Scoring System"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@500;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-gray-100 flex flex-col min-h-screen"> <main class="flex-1"> ${renderSlot($$result, $$slots["default"])} </main></body></html>`;
}, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
