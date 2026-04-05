/* empty css               */
import { c as createComponent } from './astro-component_BB6JYyY2.mjs';
import 'piccolore';
import { h as addAttribute, o as renderHead, r as renderTemplate } from './server_DKuyG52f.mjs';
import 'clsx';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const title = "FTC Local Scoring System";
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex flex-col items-center justify-center"> <div class="text-center p-8 bg-white rounded-2xl max-w-md w-full"> <img src="/favicon.svg" alt="FTC Logo" class="w-16 h-16 mx-auto mb-4"> <h1 class="text-4xl font-extrabold text-slate-800 mb-2">
Bienvenido
</h1> <p class="text-lg text-slate-600 mb-6">
al Sistema Local de Puntuación FTC
</p> <a href="/auth/login" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-semibold shadow hover:bg-blue-700 transition-all duration-300">
Entrar al Sistema
</a> </div> <footer class="mt-6 text-sm text-slate-500 text-center">
Desarrollado por
<a href="https://github.com/isanchezv07" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline ml-1">
@isanchezv07
</a> </footer> </body></html>`;
}, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/index.astro", void 0);

const $$file = "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
