/* empty css               */
import { c as createComponent } from './astro-component_Bb9ym4YD.mjs';
import 'piccolore';
import { p as renderComponent, r as renderTemplate } from './server_Bm-gGydo.mjs';
import { $ as $$Layout } from './Layout_Bdku1wEs.mjs';
import { L as LoginForm } from './LoginForm__VCCkw09.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const title = "FLL México - Iniciar Sesión";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/LoginForm", "client:component-export": "default" })} ` })}`;
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
