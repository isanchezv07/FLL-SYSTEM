/* empty css               */
import { c as createComponent } from './astro-component_Bb9ym4YD.mjs';
import 'piccolore';
import { q as createRenderInstruction, r as renderTemplate, p as renderComponent, o as renderHead } from './server_Bm-gGydo.mjs';
/* empty css                */

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Ref = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="utf-8"><!-- VIEWPORT FIX --><meta name="viewport" content="width=device-width, initial-scale=1"><title>Referee - Mission Map</title><script>\n      const isAuthenticated = localStorage.getItem("isAuthenticated");\n      const role = localStorage.getItem("role");\n\n      if (isAuthenticated !== "true" || role !== "ref") {\n        window.location.replace("/auth/login");\n      }\n    <\/script>', '</head> <body class="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#111827] to-[#020617] text-white flex flex-col"> <!-- HEADER --> <header class="w-full flex justify-between items-center px-4 md:px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/20"> <h1 class="text-base md:text-xl font-bold tracking-wide text-white/90">\nReferee • Mission Map\n</h1> <button id="btn-logout-ref" class="bg-red-600 hover:bg-red-500 active:scale-95 transition-all px-4 py-2 rounded-lg font-semibold text-sm shadow-lg shadow-red-900/40 border border-red-400/30">\nCerrar Sesión\n</button> </header> <!-- CONTENIDO --> <main class="flex-1 flex items-start md:items-center justify-center p-4 md:p-6"> <div class="w-full max-w-6xl bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl p-4 md:p-6"> ', " </div> </main> ", " </body> </html>"])), renderHead(), renderComponent($$result, "RefereeMap", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/roles/referee/Referee", "client:component-export": "default" }), renderScript($$result, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/roles/referee/ref.astro?astro&type=script&index=0&lang.ts"));
}, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/roles/referee/ref.astro", void 0);

const $$file = "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/roles/referee/ref.astro";
const $$url = "/roles/referee/ref";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ref,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
