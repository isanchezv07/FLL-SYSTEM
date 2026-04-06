/* empty css               */
import { c as createComponent } from './astro-component_rpgzD8Yj.mjs';
import 'piccolore';
import { o as renderHead, p as renderComponent, r as renderTemplate } from './server_C7koQ5Qg.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const userFound = await response.json();
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", userFound.username);
        localStorage.setItem("role", userFound.role);
        localStorage.setItem("token", userFound.token);
        toast.success(`Bienvenido, ${userFound.username}`);
        switch (userFound.role) {
          case "admin":
            window.location.href = "/roles/admin/admin_dashboard";
            break;
          case "ref":
            window.location.href = "/roles/referee/ref";
            break;
          default:
            window.location.href = "/auth/login";
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Usuario o contraseña incorrectos");
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error al autenticar usuario:", error);
      toast.error("Error al conectar con el servidor");
      localStorage.clear();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col justify-between bg-gray-100 px-4", children: [
    /* @__PURE__ */ jsx(ToastContainer, { position: "top-right", autoClose: 3e3 }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm bg-white shadow-lg rounded-xl p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-center mb-6", children: /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "Login" }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "username", className: "block text-gray-700 text-lg mb-2", children: "Username" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "username",
              name: "username",
              required: true,
              value: formData.username,
              onChange: handleChange,
              className: "w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-gray-700 text-lg mb-2", children: "Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              id: "password",
              name: "password",
              required: true,
              value: formData.password,
              onChange: handleChange,
              className: "w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-blue-500",
            children: "Login"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("footer", { className: "text-center text-sm py-4 text-gray-500", children: [
      "Developed by",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "https://github.com/isanchezv07",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-blue-600 hover:underline",
          children: "@isanchezv07"
        }
      )
    ] })
  ] });
};

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>LEGO Timer - Login</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@500;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-gray-100 flex flex-col min-h-screen"> <main class="flex-1"> <div class="min-h-screen flex items-center justify-center"> ${renderComponent($$result, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/LoginForm", "client:component-export": "default" })} </div> </main> </body></html>`;
}, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/auth/login.astro", void 0);

const $$file = "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/auth/login.astro";
const $$url = "/auth/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
