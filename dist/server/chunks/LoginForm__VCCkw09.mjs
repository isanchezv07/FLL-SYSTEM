import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
/* empty css                        */

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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col justify-center items-center bg-[#f8fafc] relative overflow-hidden font-sans", children: [
    /* @__PURE__ */ jsx(ToastContainer, { position: "top-right", autoClose: 3e3 }),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-0", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" }),
      /* @__PURE__ */ jsxs("div", { className: "absolute top-0 left-0 w-full h-1 flex", children: [
        /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-gradient-to-r from-[#006847] to-[#008f62]" }),
        /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-white" }),
        /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-gradient-to-r from-[#CE1126] to-[#ef4444]" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-700", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden border border-white/20", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-8 pb-0 text-center", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/img/logo_internacional.svg",
              alt: "FLL Logo",
              className: "h-16 mx-auto"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 mt-6 font-medium", children: "Sistema de Puntaje" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-8", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "username", className: "text-xs font-bold text-gray-500 uppercase tracking-widest ml-1", children: "Usuario" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "username",
                name: "username",
                required: true,
                placeholder: "user123",
                value: formData.username,
                onChange: handleChange,
                className: "w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006847]/10 focus:border-[#006847] transition-all duration-200 placeholder:text-gray-300"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-xs font-bold text-gray-500 uppercase tracking-widest ml-1", children: "Contraseña" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                id: "password",
                name: "password",
                required: true,
                placeholder: "••••••••",
                value: formData.password,
                onChange: handleChange,
                className: "w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006847]/10 focus:border-[#006847] transition-all duration-200 placeholder:text-gray-300"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              className: "w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-gray-900/20 transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest text-sm relative overflow-hidden group",
              children: [
                /* @__PURE__ */ jsxs("span", { className: "relative z-10 flex items-center justify-center gap-2", children: [
                  "Iniciar Sesión",
                  /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z", clipRule: "evenodd" }) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[#006847] via-transparent to-[#CE1126] opacity-0 group-hover:opacity-10 transition-opacity duration-500" })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50/50 px-8 py-6 border-t border-gray-100 flex flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]", children: "Season 2025 - 2026" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-1 bg-[#006847] rounded-full opacity-30" }),
            /* @__PURE__ */ jsx("div", { className: "w-8 h-1 bg-gray-200 rounded-full" }),
            /* @__PURE__ */ jsx("div", { className: "w-8 h-1 bg-[#CE1126] rounded-full opacity-30" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("footer", { className: "mt-8 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 font-medium tracking-wide", children: "© 2026 FIRST LEGO League México" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://github.com/isanchezv07",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#006847] transition-colors",
            children: "System by @isanchezv07"
          }
        ) })
      ] })
    ] })
  ] });
};

export { LoginForm as L };
