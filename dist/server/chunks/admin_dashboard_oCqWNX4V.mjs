/* empty css               */
import { c as createComponent } from './astro-component_Bb9ym4YD.mjs';
import 'piccolore';
import { p as renderComponent, r as renderTemplate } from './server_Bm-gGydo.mjs';
import { $ as $$Layout } from './Layout_Bdku1wEs.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { s as socket } from './socket_CUH3mwX1.mjs';
import { toast, ToastContainer } from 'react-toastify';
/* empty css                        */
import { M as MatchTimer, a as missionValueFromMissionsFlat, m as missionBounds, b as missionValueToPatch } from './MatchTimer_CpR2t2cG.mjs';
import { LogOut, Users, Settings, Trophy, Radio, RefreshCw, UserPlus, User, Key, Shield, Trash2, EyeOff, Eye, Check, Copy, Edit2, Plus, Save, X, Monitor, Layers, ChevronLeft, ChevronRight, Pause, RotateCcw, Target, Square, Play, Megaphone, Upload, FileJson } from 'lucide-react';

const NavButton = ({ id, label, icon: Icon, active, onClick }) => /* @__PURE__ */ jsxs(
  "button",
  {
    onClick: () => onClick(id),
    className: `flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all border ${active ? "bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-900/20 scale-105 z-10" : "bg-white border-gray-200 text-gray-500 hover:border-[#006847] hover:text-[#006847] shadow-sm hover:shadow-md"}`,
    children: [
      /* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 ${active ? "text-white" : "text-gray-400 group-hover:text-[#006847]"}` }),
      label
    ]
  }
);
function DashboardLayout({ activeTab, setActiveTab, children }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#f8fafc] text-gray-800 font-sans selection:bg-[#006847]/10", children: [
    /* @__PURE__ */ jsxs("div", { className: "fixed top-0 left-0 w-full h-1 flex z-[60]", children: [
      /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-[#006847]" }),
      /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-white" }),
      /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-[#CE1126]" })
    ] }),
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex justify-between items-center shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsx("img", { src: "/img/logo_internacional.svg", alt: "FLL Logo", className: "h-10 w-auto" }) }),
        /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx(MatchTimer, {}) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsx(MatchTimer, {}) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleLogout,
            className: "flex items-center gap-2 bg-white hover:bg-red-50 text-red-500 px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border border-gray-200 hover:border-red-200 active:scale-95 shadow-sm",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Cerrar Sesión" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1600px] mx-auto p-6 lg:p-8", children: [
      /* @__PURE__ */ jsxs("nav", { className: "flex flex-wrap gap-3 mb-8", children: [
        /* @__PURE__ */ jsx(NavButton, { id: "users", label: "Usuarios", icon: Users, active: activeTab === "users", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "teams", label: "Equipos", icon: Users, active: activeTab === "teams", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "matches", label: "Partidos", icon: Settings, active: activeTab === "matches", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "scores", label: "Ranking", icon: Trophy, active: activeTab === "scores", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "awards", label: "Premios", icon: Trophy, active: activeTab === "awards", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "screens", label: "Pantallas", icon: Trophy, active: activeTab === "screens", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "qualis", label: "Qualis", icon: Radio, active: activeTab === "qualis", onClick: setActiveTab })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "animate-in fade-in slide-in-from-bottom-4 duration-700", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.05)] overflow-hidden min-h-[750px]", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1 h-1 bg-gradient-to-r from-transparent via-[#006847]/30 to-transparent" }),
        /* @__PURE__ */ jsx("div", { className: "p-8 lg:p-12", children })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none -z-10 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-30" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#006847]/5 blur-[120px] rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#CE1126]/5 blur-[120px] rounded-full" })
    ] })
  ] });
}

function UsersSection({ users: initialUsers, refresh }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [showForm, setShowShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", role: "ref" });
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);
  const togglePassword = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2e3);
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        refresh();
        setShowShowForm(false);
        setFormData({ username: "", password: "", role: "ref" });
      }
    } catch (e2) {
      console.error(e2);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este usuario de forma permanente?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) refresh();
    } catch (e) {
      console.error(e);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-10 animate-in fade-in duration-700 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 p-8 rounded-[40px] border border-white shadow-xl shadow-gray-200/50 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black text-gray-900 tracking-tighter uppercase italic", children: "Gestión de Usuarios" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-[#006847] rounded-full animate-pulse" }),
          "Control de accesos y credenciales del sistema"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: refresh,
            className: "p-4 bg-white hover:bg-gray-50 text-gray-400 rounded-2xl border border-gray-100 transition-all active:scale-90 shadow-sm",
            title: "Refrescar lista",
            children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowShowForm(!showForm),
            className: `flex items-center gap-3 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-lg ${showForm ? "bg-white text-gray-400 border border-gray-200" : "bg-gray-900 hover:bg-black text-white shadow-gray-900/20 border border-gray-900"}`,
            children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4" }),
              showForm ? "Cerrar Formulario" : "Crear Acceso"
            ]
          }
        )
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsx("div", { className: "bg-white/80 border border-white rounded-[48px] p-10 backdrop-blur-2xl animate-in slide-in-from-top-8 duration-500 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)]", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4", children: "Nombre de Usuario" }),
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx(User, { className: "absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#006847] transition-colors" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              type: "text",
              placeholder: "Ej: mesa_norte_01",
              className: "w-full bg-white border border-gray-200 p-5 pl-14 rounded-[24px] outline-none focus:border-[#006847] focus:ring-4 focus:ring-[#006847]/5 text-gray-800 font-bold transition-all shadow-sm",
              value: formData.username,
              onChange: (e) => setFormData({ ...formData, username: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4", children: "Clave de Acceso" }),
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx(Key, { className: "absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#006847] transition-colors" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              type: "text",
              placeholder: "Contraseña robusta",
              className: "w-full bg-white border border-gray-200 p-5 pl-14 rounded-[24px] outline-none focus:border-[#006847] focus:ring-4 focus:ring-[#006847]/5 text-gray-800 font-bold transition-all shadow-sm",
              value: formData.password,
              onChange: (e) => setFormData({ ...formData, password: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4", children: "Nivel de Privilegios" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "flex-1 bg-white border border-gray-200 p-5 rounded-[24px] outline-none focus:border-[#006847] focus:ring-4 focus:ring-[#006847]/5 text-gray-800 font-bold appearance-none cursor-pointer shadow-sm",
              value: formData.role,
              onChange: (e) => setFormData({ ...formData, role: e.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "ref", children: "Juez de Campo (Referee)" }),
                /* @__PURE__ */ jsx("option", { value: "admin", children: "Administrador Total" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("button", { className: "bg-[#006847] hover:bg-[#005a3e] text-white px-10 rounded-[24px] font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-[#006847]/20 active:scale-95 transform hover:-translate-y-0.5", children: "Registrar" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: users.map((user) => {
      const isPasswordVisible = visiblePasswords[user.id];
      return /* @__PURE__ */ jsxs("div", { className: "group relative bg-white border border-gray-100 p-8 rounded-[40px] transition-all duration-500 hover:border-[#006847]/20 hover:shadow-2xl hover:shadow-gray-200/50 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-[#006847]/5 blur-3xl -mr-16 -mt-16 pointer-events-none transition-all group-hover:bg-[#006847]/10" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-8", children: [
            /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-6 ${user.role === "admin" ? "bg-purple-50 border-purple-100 text-purple-600" : "bg-[#006847]/5 border-[#006847]/10 text-[#006847]"}`, children: /* @__PURE__ */ jsx(Shield, { className: "w-7 h-7" }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDelete(user.id),
                className: "p-3 text-gray-300 hover:text-[#CE1126] hover:bg-red-50 rounded-xl transition-all",
                title: "Eliminar usuario",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1", children: "Identificador" }),
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-gray-900 uppercase tracking-tighter truncate italic", children: user.username })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between group/field", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5", children: "Clave de Acceso" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-gray-600 tracking-wider", children: isPasswordVisible ? user.password : "••••••••" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => togglePassword(user.id),
                      className: "p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-900 transition-colors shadow-sm",
                      children: isPasswordVisible ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => copyToClipboard(user.password, user.id + "-pass"),
                      className: "p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#006847] transition-colors shadow-sm",
                      children: copiedId === user.id + "-pass" ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-[#006847]" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between px-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${user.role === "admin" ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "bg-[#006847] shadow-[0_0_8px_rgba(0,104,71,0.5)]"}` }),
                /* @__PURE__ */ jsx("span", { className: `text-[10px] font-black uppercase tracking-[0.2em] ${user.role === "admin" ? "text-purple-600" : "text-[#006847]"}`, children: user.role === "admin" ? "Administrador" : "Juez de Campo" })
              ] }) })
            ] })
          ] })
        ] })
      ] }, user.id);
    }) })
  ] });
}

function TeamsSection({ teams, refresh }) {
  const [formData, setFormData] = useState({ number: "", name: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.number.trim() || !formData.name.trim()) {
      toast.error("Número y nombre son requeridos");
      return;
    }
    setLoading(true);
    try {
      const url = editingId ? `/api/teams/${editingId}` : "/api/teams";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al procesar equipo");
      }
      toast.success(editingId ? "Equipo actualizado" : "Equipo creado");
      setFormData({ number: "", name: "" });
      setEditingId(null);
      refresh();
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (team) => {
    setEditingId(team.id);
    setFormData({
      number: team.number,
      name: team.name
    });
  };
  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este equipo?")) return;
    try {
      const response = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Equipo eliminado");
        refresh();
      } else {
        const data = await response.json();
        toast.error("Error: " + data.error);
      }
    } catch (error) {
      toast.error("Error al eliminar equipo");
    }
  };
  const filteredTeams = teams.filter(
    (t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.number.toString().includes(searchTerm)
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black uppercase tracking-tighter text-white", children: "Gestión de Equipos" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs font-bold uppercase tracking-widest mt-1", children: "Administra los equipos registrados en teams.json" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl h-fit", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20", children: editingId ? /* @__PURE__ */ jsx(Edit2, { className: "text-white w-5 h-5" }) : /* @__PURE__ */ jsx(Plus, { className: "text-white w-5 h-5" }) }),
          /* @__PURE__ */ jsx("h3", { className: "font-black uppercase tracking-widest text-sm text-white", children: editingId ? "Editar Equipo" : "Nuevo Equipo" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2", children: "Número de Equipo" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Ej: 101",
                value: formData.number,
                onChange: (e) => setFormData((prev) => ({ ...prev, number: e.target.value })),
                className: "w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-500 outline-none transition-all",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2", children: "Nombre del Equipo" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Ej: Cyber Bots",
                value: formData.name,
                onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
                className: "w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-500 outline-none transition-all",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-4", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: loading,
                className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50",
                children: [
                  editingId ? /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                  loading ? "Procesando..." : editingId ? "Actualizar" : "Crear Equipo"
                ]
              }
            ),
            editingId && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setEditingId(null);
                  setFormData({ number: "", name: "" });
                },
                className: "px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/40 p-4 rounded-3xl border border-slate-800 flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(Users, { className: "w-5 h-5 text-slate-500 ml-2" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Buscar por nombre o número...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "bg-transparent border-none outline-none text-white font-bold text-sm w-full placeholder:text-slate-600"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest", children: [
            filteredTeams.length,
            " Equipos"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800", children: [
          filteredTeams.map((team) => /* @__PURE__ */ jsx("div", { className: "bg-slate-900/60 border-2 border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 transition-all group", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1", children: [
                "#",
                team.number
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-lg font-black text-white uppercase truncate max-w-[200px]", children: team.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleEdit(team),
                  className: "p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-all",
                  children: /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDelete(team.id),
                  className: "p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] })
          ] }) }, team.id)),
          filteredTeams.length === 0 && /* @__PURE__ */ jsxs("div", { className: "col-span-full py-20 text-center bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-800", children: [
            /* @__PURE__ */ jsx(Users, { className: "w-12 h-12 text-slate-800 mx-auto mb-4" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-600 font-black uppercase tracking-widest text-xs", children: "No se encontraron equipos" })
          ] })
        ] })
      ] })
    ] })
  ] });
}

function AllianceSelection({ onClose }) {
  const [teams, setTeams] = useState([]);
  const [alliancesData, setAlliancesData] = useState({ active: false, alliances: [] });
  const [timerState, setTimerState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bracketSize, setBracketSize] = useState(8);
  const [bracketMode, setBracketMode] = useState("2vs2");
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    fetchTeams();
    socket.on("timerUpdate", (data) => {
      setTimerState(data);
    });
    socket.on("alliancesUpdate", (data) => {
      if (data) {
        setAlliancesData(data);
      }
    });
    socket.emit("getAlliances");
    return () => {
      socket.off("timerUpdate");
      socket.off("alliancesUpdate");
    };
  }, []);
  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      const teamsList = Array.isArray(data) ? data : data.teams || [];
      setTeams(teamsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const isSelectionActive = alliancesData.active;
  const saveAlliances = (newAlliances) => {
    socket.emit("updateAlliances", {
      active: isSelectionActive,
      alliances: newAlliances.map((a) => ({
        ...a,
        teamNames: a.teams.map((num) => teams.find((t) => t.number === num)?.name || "Unknown")
      }))
    });
  };
  const addAlliance = () => {
    const newId = alliancesData.alliances.length > 0 ? Math.max(...alliancesData.alliances.map((a) => a.id)) + 1 : 1;
    const updated = [...alliancesData.alliances, { id: newId, teams: [] }];
    setAlliancesData((prev) => ({ ...prev, alliances: updated }));
    saveAlliances(updated);
  };
  const removeAlliance = (id) => {
    const updated = alliancesData.alliances.filter((a) => a.id !== id);
    setAlliancesData((prev) => ({ ...prev, alliances: updated }));
    saveAlliances(updated);
  };
  const addTeamToAlliance = (allianceId, teamNumber) => {
    const updated = alliancesData.alliances.map((a) => {
      if (a.id === allianceId) {
        if (a.teams.includes(teamNumber)) return a;
        const maxTeams = bracketMode === "2vs2" ? 2 : 1;
        if (a.teams.length >= maxTeams) return a;
        return { ...a, teams: [...a.teams, teamNumber] };
      }
      return a;
    });
    setAlliancesData((prev) => ({ ...prev, alliances: updated }));
    saveAlliances(updated);
  };
  const removeTeamFromAlliance = (allianceId, teamNumber) => {
    const updated = alliancesData.alliances.map((a) => {
      if (a.id === allianceId) {
        return { ...a, teams: a.teams.filter((t) => t !== teamNumber) };
      }
      return a;
    });
    setAlliancesData((prev) => ({ ...prev, alliances: updated }));
    saveAlliances(updated);
  };
  const toggleDisplay = async (active) => {
    if (active) {
      await fetch("/api/brackets/reset", { method: "POST" });
    }
    socket.emit("updateAlliances", {
      active,
      alliances: alliancesData.alliances.map((a) => ({
        ...a,
        teamNames: a.teams.map((num) => teams.find((t) => t.number === num)?.name || "Unknown")
      }))
    });
  };
  const generateBracket = async () => {
    const requiredAlliances = bracketMode === "1vs1" ? bracketSize / 2 : bracketSize / 4;
    if (alliancesData.alliances.length < requiredAlliances) {
      alert(`Se requieren al menos ${requiredAlliances} alianzas para un bracket de ${bracketSize} equipos.`);
      return;
    }
    const maxTeamsPerAlliance = bracketMode === "2vs2" ? 2 : 1;
    if (alliancesData.alliances.some((a) => a.teams.length < maxTeamsPerAlliance)) {
      alert(`Todas las alianzas deben tener ${maxTeamsPerAlliance} equipos.`);
      return;
    }
    if (!confirm("¿Generar bracket con estas alianzas? Se borrarán los datos actuales.")) return;
    try {
      const alliancesForBackend = alliancesData.alliances.map((a) => a.teams);
      await fetch("/api/brackets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: bracketSize, mode: bracketMode, alliances: alliancesForBackend })
      });
      alert("Bracket generado con éxito");
      toggleDisplay(false);
      onClose();
    } catch (e) {
      alert("Error al generar bracket");
    }
  };
  const resetTournament = async () => {
    if (!confirm("¿Estás seguro de REINICIAR TODO el torneo? Se borrarán matches y brackets.")) return;
    try {
      await fetch("/api/brackets/reset", { method: "POST" });
      alert("Torneo reiniciado");
      setAlliancesData({ active: false, alliances: [] });
      socket.emit("updateAlliances", { active: false, alliances: [] });
    } catch (e) {
      alert("Error al reiniciar");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-900/60 backdrop-blur-3xl", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-7xl h-full max-h-[95vh] bg-white border border-white/20 rounded-[60px] shadow-[0_48px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-8 lg:p-10 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-xl shadow-blue-500/20", children: /* @__PURE__ */ jsx(Shield, { className: "w-8 h-8 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-black uppercase tracking-tighter leading-none italic", children: [
              "Selección de ",
              /* @__PURE__ */ jsx("span", { className: "text-blue-600", children: "Alianzas" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2", children: "Manual Alliance Drafting" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setBracketMode("1vs1"),
                className: `px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${bracketMode === "1vs1" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`,
                children: "1 vs 1"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setBracketMode("2vs2"),
                className: `px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${bracketMode === "2vs2" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`,
                children: "2 vs 2"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: bracketSize,
              onChange: (e) => setBracketSize(Number(e.target.value)),
              className: "bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none",
              children: [4, 8, 16, 32].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                "Top ",
                n
              ] }, n))
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleDisplay(!isSelectionActive),
              className: `flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${isSelectionActive ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-gray-900 text-white shadow-gray-900/20"}`,
              children: [
                /* @__PURE__ */ jsx(Monitor, { className: "w-4 h-4" }),
                isSelectionActive ? "Ocultar en Pantalla" : "Mostrar en Pantalla"
              ]
            }
          ),
          /* @__PURE__ */ jsx("button", { onClick: onClose, className: "w-14 h-14 bg-gray-50 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all border border-gray-100", children: /* @__PURE__ */ jsx(X, { className: "w-6 h-6" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-hidden flex", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-80 border-r border-gray-100 bg-gray-50/50 flex flex-col", children: [
          /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-gray-100 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Users, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "BUSCAR EQUIPO...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "w-full bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-500 transition-all"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-2", children: loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-20 text-[10px] font-black text-gray-300 uppercase tracking-widest", children: "Cargando equipos..." }) : teams.filter(
            (t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.number.toString().includes(searchTerm)
          ).map((team) => {
            const isAssigned = alliancesData.alliances.some((a) => a.teams.includes(team.number));
            return /* @__PURE__ */ jsx(
              "div",
              {
                className: `p-4 rounded-2xl border transition-all ${isAssigned ? "opacity-30 pointer-events-none bg-gray-100 border-gray-200" : "bg-white border-gray-100 shadow-sm hover:border-blue-500 hover:translate-x-1"}`,
                children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1", children: [
                      "#",
                      team.number
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-black uppercase text-gray-900 leading-tight", children: team.name })
                  ] }),
                  !isAssigned && /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: alliancesData.alliances.map((a) => /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => addTeamToAlliance(a.id, team.number),
                      className: "w-8 h-8 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                      title: `Asignar a Alianza ${a.id}`,
                      children: a.id
                    },
                    a.id
                  )) })
                ] })
              },
              team.id
            );
          }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 bg-white overflow-y-auto p-10", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-8", children: [
          alliancesData.alliances.map((alliance) => /* @__PURE__ */ jsxs("div", { className: "bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[40px] p-8 flex flex-col gap-6 relative group hover:border-blue-200 hover:bg-blue-50/20 transition-all", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xl italic", children: alliance.id }),
                /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black uppercase tracking-tight italic", children: [
                  "Alianza ",
                  /* @__PURE__ */ jsxs("span", { className: "text-blue-600", children: [
                    "#",
                    alliance.id
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => removeAlliance(alliance.id),
                  className: "p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4", children: Array.from({ length: bracketMode === "2vs2" ? 2 : 1 }).map((_, idx) => {
              const teamNum = alliance.teams[idx];
              const team = teams.find((t) => t.number === teamNum);
              return /* @__PURE__ */ jsx("div", { className: `h-32 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${team ? "bg-white border-blue-500 shadow-lg shadow-blue-500/10" : "bg-white/50 border-gray-200"}`, children: team ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => removeTeamFromAlliance(alliance.id, team.number),
                    className: "absolute top-10 right-10 p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-all",
                    children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1", children: [
                  "TEAM #",
                  team.number
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-black uppercase tracking-tight text-gray-900 line-clamp-2", children: team.name })
              ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 text-gray-300", children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-6 h-6" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase tracking-widest", children: "Esperando Equipo" })
              ] }) }, idx);
            }) })
          ] }, alliance.id)),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: addAlliance,
              className: "h-full min-h-[250px] bg-white border-4 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-gray-300 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all group",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all", children: /* @__PURE__ */ jsx(Plus, { className: "w-8 h-8" }) }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-black uppercase tracking-[0.3em]", children: "Agregar Alianza" })
              ]
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-8 border-t border-gray-100 bg-white flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1", children: "Resumen" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-black text-gray-900 tabular-nums", children: [
            alliancesData.alliances.length,
            " Alianzas • ",
            alliancesData.alliances.reduce((acc, a) => acc + a.teams.length, 0),
            " Equipos"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: resetTournament,
              className: "flex items-center gap-4 bg-red-50 hover:bg-red-100 text-[#CE1126] border border-red-200 px-8 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 shadow-sm",
              children: [
                /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
                "Reiniciar Torneo"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: generateBracket,
              disabled: alliancesData.alliances.length === 0,
              className: "flex items-center gap-4 bg-[#006847] hover:bg-[#005a3e] disabled:opacity-20 text-white px-12 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-[#006847]/20 transition-all active:scale-95 group",
              children: [
                /* @__PURE__ */ jsx(Layers, { className: "w-5 h-5" }),
                "Generar Bracket con Alianzas"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}

const MISSION_NAMES = {
  "1": "Surface Brushing",
  "2": "Map Reveal",
  "3-4": "Mineshaft / Recovery",
  "5": "Who Lived Here?",
  "6": "Forge",
  "7": "Heavy Lifting",
  "8": "Silo",
  "9": "What's on Sale?",
  "10": "Tip the Scales",
  "11": "Angler Artifacts",
  "12": "Salvage Operation",
  "13": "Statue Rebuild",
  "14": "Forum",
  "15": "Precision Tokens"
};
function MatchesSection() {
  const [matches, setMatches] = useState([]);
  const [timerState, setTimerState] = useState({ fields: {}, fieldCount: 4 });
  const [loading, setLoading] = useState(true);
  const [bracketSize, setBracketSize] = useState(8);
  const [bracketMode, setBracketMode] = useState("2vs2");
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [showAllianceSelection, setShowAllianceSelection] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  useEffect(() => {
    fetchMatches();
    const handler = () => fetchMatches();
    socket.on("matchesUpdate", handler);
    socket.on("timerUpdate", (data) => setTimerState(data));
    socket.emit("getTimer");
    return () => {
      socket.off("matchesUpdate", handler);
      socket.off("timerUpdate");
    };
  }, []);
  const assignToField = (fieldId, matchId) => {
    socket.emit("assignMatchToField", { fieldId, matchId });
  };
  const updateFieldCount = (count) => {
    socket.emit("updateTimer", { fieldCount: count });
  };
  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      const match = matches.find((m) => m.id === id);
      const firstSelected = matches.find((m) => m.id === prev[0]);
      if (firstSelected && match && match.round !== firstSelected.round) {
        alert("Solo puedes seleccionar partidos de la misma ronda");
        return prev;
      }
      return [...prev, id];
    });
  };
  const launchSimultaneous = async () => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length > timerState.fieldCount) {
      alert(`Máximo ${timerState.fieldCount} partidos simultáneos (uno por cancha activa)`);
      return;
    }
    for (let i = 1; i <= timerState.fieldCount; i++) {
      socket.emit("assignMatchToField", { fieldId: `cancha${i}`, matchId: null });
    }
    for (let i = 0; i < selectedIds.length; i++) {
      const mId = selectedIds[i];
      socket.emit("assignMatchToField", { fieldId: `cancha${i + 1}`, matchId: mId });
      await fetch(`/api/matches/${mId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" })
      });
    }
    setSelectionMode(false);
    setSelectedIds([]);
    socket.emit("resetTimer");
    alert(`Lanzados ${selectedIds.length} partidos simultáneos`);
  };
  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };
  const activeMatchId = editingMatchId;
  const editingMatch = useMemo(() => matches.find((m) => m.id === activeMatchId) || null, [matches, activeMatchId]);
  const updateMatchMissions = async (matchId, teamKey, missionId, delta) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    const missions = match[teamKey] || {};
    const currentValue = missionValueFromMissionsFlat(missionId, missions);
    const bounds = missionBounds[missionId];
    const newValue = Math.max(bounds.min, Math.min(bounds.max, currentValue + delta));
    const patch = missionValueToPatch(missionId, newValue);
    setMatches((prev) => prev.map((m) => {
      if (m.id === matchId) return { ...m, [teamKey]: { ...m[teamKey], ...patch } };
      return m;
    }));
    try {
      await fetch(`/api/matches/${matchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [teamKey]: patch })
      });
    } catch (e) {
      fetchMatches();
    }
  };
  const rounds = useMemo(() => {
    const grouped = {};
    matches.forEach((m) => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return Object.keys(grouped).map(Number).sort((a, b) => a - b).map((r) => ({
      number: r,
      matches: grouped[r].sort((a, b) => a.position - b.position)
    }));
  }, [matches]);
  if (loading) return /* @__PURE__ */ jsx("div", { className: "flex justify-center p-20 animate-pulse text-blue-500 font-black tracking-widest uppercase", children: "Initializing Command Center..." });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-10 pb-20 animate-in fade-in duration-700 font-sans", children: [
    /* @__PURE__ */ jsx("div", { className: "sticky top-4 z-40 bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-4 lg:p-6 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-6 items-center justify-center lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-4 bg-gray-50 p-2 rounded-[24px] border border-gray-100 shadow-inner", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => socket.emit("prevMatch"),
            className: "p-3 sm:p-4 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all active:scale-90 border border-gray-200 shadow-sm",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5 sm:w-6 h-6" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "px-2 sm:px-6 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[8px] sm:text-[9px] font-black text-[#006847] uppercase tracking-[0.3em] mb-1 italic", children: "Navegación" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm sm:text-xl font-black text-gray-900 tabular-nums tracking-tighter uppercase italic", children: "Cambiar Partido" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => socket.emit("nextMatch"),
            className: "p-3 sm:p-4 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all active:scale-90 border border-gray-200 shadow-sm",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 sm:w-6 h-6" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setSelectionMode(false);
                setSelectedIds([]);
              },
              className: `px-3 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${!selectionMode ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-900"}`,
              children: "Clásico"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectionMode(true),
              className: `px-3 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${selectionMode ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-900"}`,
              children: "Simultáneo"
            }
          )
        ] }),
        !selectionMode ? /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => socket.emit("startTimer"),
            className: "flex items-center gap-2 sm:gap-4 bg-[#006847] hover:bg-[#005a3e] text-white px-6 sm:px-10 py-4 sm:py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] sm:text-sm shadow-xl shadow-[#006847]/20 transition-all active:scale-95 group transform hover:-translate-y-1",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-2 h-2 sm:w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" }),
              "Iniciar Motor"
            ]
          }
        ) : /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: launchSimultaneous,
            disabled: selectedIds.length === 0,
            className: "flex items-center gap-2 sm:gap-4 bg-gray-900 hover:bg-black text-white px-6 sm:px-10 py-4 sm:py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] sm:text-sm shadow-xl shadow-gray-900/20 transition-all active:scale-95 disabled:opacity-20 group transform hover:-translate-y-1",
            children: [
              "Lanzar ",
              selectedIds.length,
              " Partidos"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => socket.emit("pauseTimer"),
              className: "p-4 sm:p-5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-[24px] border border-amber-200 transition-all active:scale-90 shadow-sm",
              title: "Pause Timer",
              children: /* @__PURE__ */ jsx(Pause, { className: "w-5 h-5 sm:w-6 h-6 fill-current" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => socket.emit("resetTimer"),
              className: "p-4 sm:p-5 bg-red-50 hover:bg-red-100 text-[#CE1126] rounded-[24px] border border-red-200 transition-all active:scale-90 shadow-sm",
              title: "Reset Timer",
              children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-5 h-5 sm:w-6 h-6" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-4 bg-gray-50 p-3 rounded-[24px] border border-gray-100 shadow-inner", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowAllianceSelection(true),
            className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[8px] sm:text-[9px] transition-all shadow-md active:scale-95",
            children: [
              /* @__PURE__ */ jsx(Shield, { className: "w-3 h-3" }),
              "Alianzas"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col px-2 border-r border-gray-200", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center", children: "Canchas" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: timerState.fieldCount,
                onChange: (e) => updateFieldCount(Number(e.target.value)),
                className: "bg-transparent text-[#006847] font-black text-[10px] sm:text-xs outline-none uppercase tracking-widest cursor-pointer",
                children: [1, 2, 3, 4, 5, 6].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                  n,
                  " Canchas"
                ] }, n))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col px-2 border-r border-gray-200", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center", children: "Modo" }),
            /* @__PURE__ */ jsxs("select", { value: bracketMode, onChange: (e) => setBracketMode(e.target.value), className: "bg-transparent text-gray-900 font-black text-[10px] sm:text-xs outline-none uppercase tracking-widest cursor-pointer", children: [
              /* @__PURE__ */ jsx("option", { value: "1vs1", children: "1 vs 1" }),
              /* @__PURE__ */ jsx("option", { value: "2vs2", children: "2 vs 2" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col px-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center", children: "Top" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: bracketSize,
                onChange: (e) => setBracketSize(Number(e.target.value)),
                className: "bg-transparent font-black text-[10px] sm:text-xs uppercase tracking-widest focus:outline-none px-1 text-gray-900 cursor-pointer",
                children: [0, 4, 8, 16, 32].map((n) => /* @__PURE__ */ jsx("option", { value: n, children: n }, n))
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "px-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col mb-12", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-5xl font-black text-gray-900 uppercase tracking-tighter italic", children: [
          "Bracket del ",
          /* @__PURE__ */ jsx("span", { className: "text-[#006847]", children: "Tor" }),
          "neo"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Target, { className: "w-3 h-3 text-[#006847]" }),
          "Haz clic en un partido para editar puntajes por misión"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-12 overflow-x-auto pb-12 scrollbar-hide snap-x", children: rounds.length > 0 ? rounds.map((round) => /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 w-80 space-y-8 snap-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 font-black text-lg text-[#006847] shadow-lg shadow-gray-200/50 italic", children: round.number }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none mb-1", children: "Fase de Ronda" }),
            /* @__PURE__ */ jsxs("span", { className: "text-[8px] font-bold text-[#CE1126] uppercase tracking-[0.2em] leading-none", children: [
              "Ronda #",
              round.number
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: round.matches.map((match) => /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => selectionMode ? toggleSelection(match.id) : setEditingMatchId(match.id),
            className: `group relative bg-white border rounded-[32px] p-6 cursor-pointer transition-all duration-500 hover:scale-[1.05] shadow-xl shadow-gray-200/40 ${selectedIds.includes(match.id) ? "border-amber-500 bg-amber-50 shadow-amber-200/50" : match.status === "in_progress" ? "border-[#006847] shadow-[#006847]/10 bg-white" : "border-gray-100 hover:border-gray-300"}`,
            children: [
              selectedIds.includes(match.id) && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest z-30 animate-bounce shadow-lg", children: "Seleccionado" }),
              /* @__PURE__ */ jsxs("div", { className: "absolute -top-3 left-8 bg-white px-4 py-1.5 rounded-full border border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] z-10 group-hover:text-[#006847] transition-colors shadow-sm italic", children: [
                "PARTIDO #",
                match.position
              ] }),
              /* @__PURE__ */ jsx("div", { className: "absolute -top-3 right-4 z-20 flex gap-1", children: Array.from({ length: timerState.fieldCount }).map((_, idx) => {
                const f = `cancha${idx + 1}`;
                const isAssigned = timerState.fields?.[f] === match.id;
                return /* @__PURE__ */ jsx(
                  "button",
                  {
                    title: f,
                    onClick: (e) => {
                      e.stopPropagation();
                      assignToField(f, isAssigned ? null : match.id);
                    },
                    className: `w-6 h-6 rounded-full text-[9px] font-black flex items-center justify-center border transition-all ${isAssigned ? "bg-[#006847] border-[#006847] text-white shadow-lg shadow-[#006847]/30" : "bg-white border-gray-200 text-gray-400 hover:border-gray-400 shadow-sm"}`,
                    children: idx + 1
                  },
                  f
                );
              }) }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-gray-800 uppercase truncate max-w-[150px] italic", children: [
                    match.teamA1 || "TBD",
                    " ",
                    match.teamA2 && `+ ${match.teamA2}`
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `font-mono font-black text-2xl tabular-nums ${match.status === "finished" && match.scoreA > match.scoreB ? "text-[#006847] drop-shadow-[0_0_8px_rgba(0,104,71,0.2)]" : "text-gray-300"}`, children: match.scoreA })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent" }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-gray-800 uppercase truncate max-w-[150px] italic", children: [
                    match.teamB1 || "TBD",
                    " ",
                    match.teamB2 && `+ ${match.teamB2}`
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `font-mono font-black text-2xl tabular-nums ${match.status === "finished" && match.scoreB > match.scoreA ? "text-[#006847] drop-shadow-[0_0_8px_rgba(0,104,71,0.2)]" : "text-gray-300"}`, children: match.scoreB })
                ] })
              ] }),
              match.status === "in_progress" && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-[80%] h-[4px] flex rounded-full overflow-hidden", children: [
                /* @__PURE__ */ jsx("div", { className: "flex-1 bg-[#006847] animate-pulse" }),
                /* @__PURE__ */ jsx("div", { className: "flex-1 bg-white" }),
                /* @__PURE__ */ jsx("div", { className: "flex-1 bg-[#CE1126] animate-pulse" })
              ] })
            ]
          },
          match.id
        )) })
      ] }, round.number)) : /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[48px] border-4 border-dashed border-gray-100", children: [
        /* @__PURE__ */ jsx(Shield, { className: "w-16 h-16 text-gray-200 mb-6" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 font-black uppercase tracking-widest text-xs", children: "No hay partidos programados" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-[10px] font-bold uppercase tracking-widest mt-2", children: "Usa el botón de Alianzas para iniciar el draft" })
      ] }) })
    ] }),
    editingMatch && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-900/40 backdrop-blur-2xl", onClick: () => setEditingMatchId(null) }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-7xl h-full max-h-[95vh] bg-[#f8fafc] border border-white rounded-[60px] shadow-[0_48px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-8 lg:p-12 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-8 bg-white/50 backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-8 text-gray-900", children: [
            /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-xl border border-gray-50 transform hover:rotate-6 transition-transform", children: /* @__PURE__ */ jsx("img", { src: "/img/logo_internacional.svg", alt: "FLL Logo", className: "h-10 w-auto" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h2", { className: "text-5xl font-black uppercase tracking-tighter leading-none italic", children: [
                "Inspector de ",
                /* @__PURE__ */ jsx("span", { className: "text-[#006847]", children: "Parti" }),
                "do"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-3", children: [
                /* @__PURE__ */ jsxs("span", { className: "px-4 py-2 bg-gray-900 rounded-xl text-[10px] font-black text-white uppercase tracking-widest", children: [
                  "Partido #",
                  editingMatch.position
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "px-4 py-2 bg-white rounded-xl border border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm", children: [
                  "Ronda ",
                  editingMatch.round
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-12 bg-white px-12 py-7 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-black text-[#006847] uppercase tracking-[0.3em] mb-1 italic", children: "ALIANZA A" }),
              /* @__PURE__ */ jsx("div", { className: "text-7xl font-mono font-black text-gray-900 tabular-nums leading-none", children: editingMatch.scoreA })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-5xl font-black text-gray-200 italic mx-4", children: "VS" }),
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-black text-[#CE1126] uppercase tracking-[0.3em] mb-1 italic", children: "ALIANZA B" }),
              /* @__PURE__ */ jsx("div", { className: "text-7xl font-mono font-black text-gray-900 tabular-nums leading-none", children: editingMatch.scoreB })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setEditingMatchId(null), className: "w-16 h-16 bg-white hover:bg-red-50 hover:text-[#CE1126] text-gray-300 rounded-3xl transition-all flex items-center justify-center border border-gray-100 shadow-sm", children: /* @__PURE__ */ jsx(X, { className: "w-8 h-8" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-10 lg:p-12 space-y-12 scrollbar-thin scrollbar-thumb-gray-200 text-gray-900 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-100", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 border-l-8 border-[#006847] pl-6 py-2", children: /* @__PURE__ */ jsxs("h3", { className: "text-3xl font-black uppercase tracking-tight italic", children: [
              "Control Alianza ",
              /* @__PURE__ */ jsx("span", { className: "text-[#006847]", children: "A" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
              /* @__PURE__ */ jsx(DetailedTeamBox, { team: "A1", name: editingMatch.teamA1, matchId: editingMatch.id, matches, onUpdate: updateMatchMissions, color: "green" }),
              /* @__PURE__ */ jsx(DetailedTeamBox, { team: "A2", name: editingMatch.teamA2, matchId: editingMatch.id, matches, onUpdate: updateMatchMissions, color: "green" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 border-l-8 border-[#CE1126] pl-6 py-2", children: /* @__PURE__ */ jsxs("h3", { className: "text-3xl font-black uppercase tracking-tight italic", children: [
              "Control Alianza ",
              /* @__PURE__ */ jsx("span", { className: "text-[#CE1126]", children: "B" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
              /* @__PURE__ */ jsx(DetailedTeamBox, { team: "B1", name: editingMatch.teamB1, matchId: editingMatch.id, matches, onUpdate: updateMatchMissions, color: "red" }),
              /* @__PURE__ */ jsx(DetailedTeamBox, { team: "B2", name: editingMatch.teamB2, matchId: editingMatch.id, matches, onUpdate: updateMatchMissions, color: "red" })
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    showAllianceSelection && /* @__PURE__ */ jsx(AllianceSelection, { onClose: () => setShowAllianceSelection(false) })
  ] });
}
function DetailedTeamBox({ team, name, matchId, matches, onUpdate, color }) {
  if (!name) return /* @__PURE__ */ jsxs("div", { className: "bg-white/50 border-4 border-gray-100 border-dashed rounded-[48px] p-12 flex flex-col items-center justify-center text-center opacity-40", children: [
    /* @__PURE__ */ jsx(Users, { className: "w-12 h-12 text-gray-200 mb-4" }),
    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-gray-300 uppercase tracking-widest", children: "Sin Asignación" })
  ] });
  const match = matches.find((m) => m.id === matchId);
  const missions = match?.[`missions${team}`] || {};
  const missionList = Object.keys(missionBounds);
  const accentColor = color === "green" ? "#006847" : "#CE1126";
  const shadowColor = color === "green" ? "rgba(0,104,71,0.2)" : "rgba(206,17,38,0.2)";
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border border-white rounded-[48px] p-8 space-y-8 relative overflow-hidden group shadow-xl shadow-gray-200/50 transition-all hover:shadow-2xl hover:scale-[1.02]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-1.5", style: { backgroundColor: accentColor, opacity: 0.3 } }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black uppercase tracking-[0.3em] mb-1 block italic", style: { color: accentColor }, children: [
        "Mesa ",
        team
      ] }),
      /* @__PURE__ */ jsx("h4", { className: "text-2xl font-black uppercase tracking-tighter italic text-gray-900 leading-none", children: name })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: missionList.map((mId) => {
      const val = missionValueFromMissionsFlat(mId, missions);
      const bounds = missionBounds[mId];
      const isMax = val === bounds.max && bounds.max > 0;
      return /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between p-4 rounded-2xl border transition-all ${isMax ? "bg-gray-50 border-gray-200" : "bg-white border-gray-50 shadow-sm"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1", children: [
            "M",
            mId.padStart(2, "0")
          ] }),
          /* @__PURE__ */ jsx("span", { className: `text-[11px] font-black uppercase tracking-tight leading-none ${isMax ? "text-gray-900" : "text-gray-500"}`, children: MISSION_NAMES[mId] || "Unknown" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-inner", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onUpdate(matchId, `missions${team}`, mId, -1),
              disabled: val <= bounds.min,
              className: "w-9 h-9 bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-20 rounded-lg font-black text-xl transition-all active:scale-90 text-gray-400 shadow-sm",
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: `font-mono font-black text-lg w-7 text-center tabular-nums ${isMax ? "text-gray-900" : "text-gray-400"}`, style: isMax ? { color: accentColor, textShadow: `0 0 10px ${shadowColor}` } : {}, children: val }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onUpdate(matchId, `missions${team}`, mId, 1),
              disabled: val >= bounds.max,
              className: "w-9 h-9 text-white disabled:opacity-20 rounded-lg font-black text-xl transition-all active:scale-90 shadow-lg",
              style: { backgroundColor: accentColor },
              children: "+"
            }
          )
        ] })
      ] }, mId);
    }) }) })
  ] });
}

function ScoresSection() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchScores();
    socket.on("matchesUpdate", fetchScores);
    return () => {
      socket.off("matchesUpdate", fetchScores);
    };
  }, []);
  const fetchScores = async () => {
    try {
      const res = await fetch("/api/matches");
      const matches = await res.json();
      const scoresMap = {};
      const addScore = (team, score) => {
        if (!team) return;
        if (!scoresMap[team]) scoresMap[team] = { total: 0, count: 0 };
        scoresMap[team].total += score || 0;
        scoresMap[team].count += 1;
      };
      matches.forEach((match) => {
        addScore(match.teamA1, match.scoreA / (match.teamA2 ? 2 : 1));
        addScore(match.teamA2, match.scoreA / 2);
        addScore(match.teamB1, match.scoreB / (match.teamB2 ? 2 : 1));
        addScore(match.teamB2, match.scoreB / 2);
      });
      const rankingArray = Object.entries(scoresMap).map(([team, data]) => ({ team, total: Math.round(data.total), matchesPlayed: data.count })).sort((a, b) => b.total - a.total);
      setRanking(rankingArray);
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-20 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-16 h-16", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 border-4 border-[#006847]/10 rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 border-4 border-[#006847] border-t-transparent rounded-full animate-spin" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-400 font-black uppercase tracking-[0.2em] text-xs", children: "Procesando Rankings" })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-700 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-black text-gray-900 tracking-tighter uppercase italic", children: [
          "Tabla de ",
          /* @__PURE__ */ jsx("span", { className: "text-[#006847]", children: "Posi" }),
          "cio",
          /* @__PURE__ */ jsx("span", { className: "text-[#CE1126]", children: "nes" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-[#006847] rounded-full animate-pulse" }),
          "Resultados en vivo del torneo"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: fetchScores,
          className: "p-4 bg-white hover:bg-gray-50 text-[#006847] rounded-2xl border border-gray-100 transition-all active:scale-90 shadow-sm",
          children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6", children: ranking.length > 0 ? ranking.map((team, index) => {
      const isFirst = index === 0;
      const isTop3 = index < 3;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `group grid grid-cols-12 items-center px-8 py-7 rounded-[40px] border transition-all duration-500 hover:scale-[1.02] shadow-xl shadow-gray-200/40 relative overflow-hidden ${isFirst ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-white text-gray-800"}`,
          children: [
            isFirst && /* @__PURE__ */ jsxs("div", { className: "absolute top-0 left-0 w-full h-1 flex", children: [
              /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-[#006847]" }),
              /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-white" }),
              /* @__PURE__ */ jsx("div", { className: "h-full flex-1 bg-[#CE1126]" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "col-span-1 flex items-center gap-4", children: /* @__PURE__ */ jsx("span", { className: `font-black text-3xl tabular-nums italic ${isFirst ? "text-white" : "text-gray-200 group-hover:text-[#006847] transition-colors"}`, children: (index + 1).toString().padStart(2, "0") }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-7 flex items-center gap-6", children: [
              /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-transform group-hover:rotate-12 border ${isFirst ? "bg-white text-gray-900 border-gray-100" : "bg-gray-50 text-gray-400 border-gray-100"}`, children: team.team.substring(0, 2).toUpperCase() }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: `font-black uppercase tracking-tight text-xl italic ${isFirst ? "text-white" : "text-gray-900"}`, children: team.team }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-bold uppercase tracking-widest ${isFirst ? "text-gray-400" : "text-gray-400"}`, children: [
                    team.matchesPlayed,
                    " Partidos Jugados"
                  ] }),
                  isTop3 && /* @__PURE__ */ jsx("div", { className: `w-1.5 h-1.5 rounded-full ${index === 0 ? "bg-[#006847]" : index === 1 ? "bg-gray-300" : "bg-[#CE1126]"}` })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-4 text-right flex flex-col items-end", children: [
              /* @__PURE__ */ jsx("div", { className: `font-mono font-black text-4xl tabular-nums tracking-tighter ${isFirst ? "text-white" : "text-[#006847]"}`, children: team.total.toLocaleString() }),
              /* @__PURE__ */ jsx("span", { className: `text-[9px] font-black uppercase tracking-[0.2em] ${isFirst ? "text-gray-500" : "text-gray-400"}`, children: "Puntos Acumulados" })
            ] })
          ]
        },
        team.team
      );
    }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-32 bg-white rounded-[60px] border-4 border-dashed border-gray-100", children: [
      /* @__PURE__ */ jsx("div", { className: "w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm", children: /* @__PURE__ */ jsx(Users, { className: "w-12 h-12 text-gray-200" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 font-black uppercase tracking-widest text-sm italic", children: "No hay datos de partidos disponibles aún" })
    ] }) })
  ] });
}

function AwardsSection() {
  const [awardsData, setAwardsData] = useState({ awards: [], announcement: { text: "", active: false }, ceremonyMode: false });
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const [awardsRes, teamsRes] = await Promise.all([
        fetch("/api/awards"),
        fetch("/api/teams")
      ]);
      if (awardsRes.ok) {
        const data = await awardsRes.ok ? await awardsRes.json() : awardsData;
        setAwardsData(data);
      }
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data);
      }
    } catch (error) {
      console.error("Error fetching awards data:", error);
    }
  };
  const handleUpdateAward = async (id, data) => {
    try {
      const response = await fetch(`/api/awards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      toast.error("Error al actualizar premio");
    }
  };
  const handleRevealStep = async (award) => {
    if (!award.revealedTitle && !award.revealedWinner) {
      const others = awardsData.awards.filter((a) => a.id !== award.id && (a.revealedTitle || a.revealedWinner));
      for (const other of others) {
        await handleUpdateAward(other.id, { revealedTitle: false, revealedWinner: false });
      }
      await handleUpdateAward(award.id, { revealedTitle: true });
      toast.success("Título del premio mostrado");
    } else if (award.revealedTitle && !award.revealedWinner) {
      await handleUpdateAward(award.id, { revealedWinner: true });
      toast.success("¡Ganador revelado!");
    } else {
      await handleUpdateAward(award.id, { revealedTitle: false, revealedWinner: false });
      toast.info("Premio ocultado");
    }
  };
  const handleAnnouncementUpdate = async (data) => {
    try {
      const response = await fetch("/api/awards/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast.success("Anuncio actualizado");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al actualizar anuncio");
    }
  };
  const handleCeremonyToggle = async () => {
    const newMode = !awardsData.ceremonyMode;
    try {
      const response = await fetch("/api/awards/ceremony", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newMode })
      });
      if (response.ok) {
        toast.success(newMode ? "Modo Ceremonia ACTIVADO" : "Modo Ceremonia DESACTIVADO");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al cambiar modo");
    }
  };
  const handleReset = async () => {
    if (!confirm("¿Estás seguro de que quieres reiniciar todos los premios y anuncios?")) return;
    try {
      const response = await fetch("/api/awards/reset", { method: "POST" });
      if (response.ok) {
        toast.success("Todo reiniciado");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al reiniciar");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black uppercase tracking-tighter text-white", children: "Ceremonia de Premiación" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs font-bold uppercase tracking-widest mt-1", children: "Control de ganadores y visibilidad" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleCeremonyToggle,
            className: `flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border-2 ${awardsData.ceremonyMode ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"}`,
            children: [
              awardsData.ceremonyMode ? /* @__PURE__ */ jsx(Square, { className: "w-4 h-4 fill-current" }) : /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 fill-current" }),
              awardsData.ceremonyMode ? "Detener Ceremonia" : "Iniciar Ceremonia"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleReset,
            className: "p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all active:scale-95",
            title: "Reiniciar Todo",
            children: /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-4", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: awardsData?.awards?.map((award) => /* @__PURE__ */ jsx("div", { className: `bg-slate-900/40 border-2 rounded-[32px] p-6 transition-all duration-300 ${award.revealedTitle ? "border-amber-500 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "border-slate-800"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-6 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center sm:text-left", children: [
          /* @__PURE__ */ jsx("div", { className: "text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1", children: "Categoría de Premio" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-black text-white uppercase", children: award.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "w-full sm:w-64", children: [
          /* @__PURE__ */ jsx("div", { className: "text-slate-600 text-[8px] font-black uppercase tracking-widest mb-1.5 ml-2", children: "Asignar Ganador" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: award.teamNumber,
              onChange: (e) => {
                const team = teams.find((t) => t.number === e.target.value);
                handleUpdateAward(award.id, {
                  teamNumber: e.target.value,
                  teamName: team ? team.name : ""
                });
              },
              className: "w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:border-blue-500 outline-none transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "--- Ninguno ---" }),
                teams.map((t) => /* @__PURE__ */ jsxs("option", { value: t.number, children: [
                  t.number,
                  " - ",
                  t.name
                ] }, t.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 min-w-[140px]", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleRevealStep(award),
              disabled: !award.teamNumber,
              className: `flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-20 disabled:grayscale ${award.revealedWinner ? "bg-red-600 text-white shadow-lg" : award.revealedTitle ? "bg-amber-500 text-white shadow-lg" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`,
              children: !award.revealedTitle ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
                " Mostrar Título"
              ] }) : !award.revealedWinner ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }),
                " Revelar Ganador"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }),
                " Ocultar Todo"
              ] })
            }
          ),
          award.revealedTitle && /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-1", children: [
            /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${award.revealedTitle ? "bg-amber-500 animate-pulse" : "bg-slate-800"}` }),
            /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${award.revealedWinner ? "bg-amber-500 animate-pulse" : "bg-slate-800"}` })
          ] })
        ] })
      ] }) }, award.id)) }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx(Megaphone, { className: "text-blue-500 w-5 h-5" }),
            /* @__PURE__ */ jsx("h3", { className: "font-black uppercase tracking-widest text-sm text-white", children: "Anuncio Global" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: awardsData?.announcement?.text || "",
                onChange: (e) => setAwardsData({ ...awardsData, announcement: { ...awardsData.announcement, text: e.target.value } }),
                className: "w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-5 py-4 text-sm text-white font-medium focus:border-blue-500 outline-none min-h-[150px] transition-all",
                placeholder: "Escribe el mensaje aquí..."
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleAnnouncementUpdate({ text: awardsData?.announcement?.text }),
                  className: "flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                    "Guardar"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleAnnouncementUpdate({ active: !awardsData?.announcement?.active }),
                  className: `flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border-2 ${awardsData?.announcement?.active ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"}`,
                  children: [
                    awardsData?.announcement?.active ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
                    awardsData?.announcement?.active ? "En Pantalla" : "Mostrar"
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/10 border border-amber-500/20 rounded-[40px] p-8", children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-amber-500 font-black uppercase tracking-widest text-[11px] mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "w-4 h-4" }),
            "Pasos para Premiar"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "text-slate-400 text-xs space-y-3 leading-relaxed", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-amber-500 font-bold", children: "1." }),
              "Asigna el ganador en la lista."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-amber-500 font-bold", children: "2." }),
              "Haz clic en ",
              /* @__PURE__ */ jsx("strong", { children: "Mostrar Título" }),
              " para que el público sepa qué premio se entrega."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-amber-500 font-bold", children: "3." }),
              "Haz clic en ",
              /* @__PURE__ */ jsx("strong", { children: "Revelar Ganador" }),
              " para mostrar el equipo y lanzar el confeti."
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}

function ScreensSection() {
  const [awardsData, setAwardsData] = useState({ awards: [], announcement: { text: "", active: false }, ceremonyMode: false });
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const [awardsRes, teamsRes] = await Promise.all([
        fetch("/api/awards"),
        fetch("/api/teams")
      ]);
      if (awardsRes.ok) {
        const data = await awardsRes.ok ? await awardsRes.json() : awardsData;
        setAwardsData(data);
      }
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data);
      }
    } catch (error) {
      console.error("Error fetching awards data:", error);
    }
  };
  const handleUpdateAward = async (id, data) => {
    try {
      const response = await fetch(`/api/awards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      toast.error("Error al actualizar premio");
    }
  };
  const handleRevealStep = async (award) => {
    if (!award.revealedTitle && !award.revealedWinner) {
      const others = awardsData.awards.filter((a) => a.id !== award.id && (a.revealedTitle || a.revealedWinner));
      for (const other of others) {
        await handleUpdateAward(other.id, { revealedTitle: false, revealedWinner: false });
      }
      await handleUpdateAward(award.id, { revealedTitle: true });
      toast.success("Título del premio mostrado");
    } else if (award.revealedTitle && !award.revealedWinner) {
      await handleUpdateAward(award.id, { revealedWinner: true });
      toast.success("¡Ganador revelado!");
    } else {
      await handleUpdateAward(award.id, { revealedTitle: false, revealedWinner: false });
      toast.info("Premio ocultado");
    }
  };
  const handleAnnouncementUpdate = async (data) => {
    try {
      const response = await fetch("/api/awards/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast.success("Anuncio actualizado");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al actualizar anuncio");
    }
  };
  const handleCeremonyToggle = async () => {
    const newMode = !awardsData.ceremonyMode;
    try {
      const response = await fetch("/api/awards/ceremony", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newMode })
      });
      if (response.ok) {
        toast.success(newMode ? "Modo Ceremonia ACTIVADO" : "Modo Ceremonia DESACTIVADO");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al cambiar modo");
    }
  };
  const handleReset = async () => {
    if (!confirm("¿Estás seguro de que quieres reiniciar todos los premios y anuncios?")) return;
    try {
      const response = await fetch("/api/awards/reset", { method: "POST" });
      if (response.ok) {
        toast.success("Todo reiniciado");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al reiniciar");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-black uppercase tracking-tighter text-white mb-6", children: "Pantallas de Visualización" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("a", { href: "/displays/live", target: "_blank", className: "bg-slate-800 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 border border-slate-700 hover:border-blue-400", children: [
          /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5" }),
          "Display Principal (Live)"
        ] }),
        /* @__PURE__ */ jsxs("a", { href: "/displays/timer", target: "_blank", className: "bg-slate-800 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 border border-slate-700 hover:border-blue-400", children: [
          /* @__PURE__ */ jsx(Play, { className: "w-5 h-5" }),
          "Timer Solo"
        ] }),
        /* @__PURE__ */ jsxs("a", { href: "/displays/qualis", target: "_blank", className: "bg-slate-800 hover:bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 border border-slate-700 hover:border-purple-400", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "w-5 h-5" }),
          "Modo Qualis"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black uppercase tracking-tighter text-white", children: "Ceremonia de Premiación" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs font-bold uppercase tracking-widest mt-1", children: "Control de ganadores y visibilidad" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleCeremonyToggle,
            className: `flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border-2 ${awardsData.ceremonyMode ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"}`,
            children: [
              awardsData.ceremonyMode ? /* @__PURE__ */ jsx(Square, { className: "w-4 h-4 fill-current" }) : /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 fill-current" }),
              awardsData.ceremonyMode ? "Detener Ceremonia" : "Iniciar Ceremonia"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleReset,
            className: "p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all active:scale-95",
            title: "Reiniciar Todo",
            children: /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-4", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: awardsData?.awards?.map((award) => /* @__PURE__ */ jsx("div", { className: `bg-slate-900/40 border-2 rounded-[32px] p-6 transition-all duration-300 ${award.revealedTitle ? "border-amber-500 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "border-slate-800"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-6 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center sm:text-left", children: [
          /* @__PURE__ */ jsx("div", { className: "text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1", children: "Categoría de Premio" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-black text-white uppercase", children: award.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "w-full sm:w-64", children: [
          /* @__PURE__ */ jsx("div", { className: "text-slate-600 text-[8px] font-black uppercase tracking-widest mb-1.5 ml-2", children: "Asignar Ganador" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: award.teamNumber,
              onChange: (e) => {
                const team = teams.find((t) => t.number === e.target.value);
                handleUpdateAward(award.id, {
                  teamNumber: e.target.value,
                  teamName: team ? team.name : ""
                });
              },
              className: "w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:border-blue-500 outline-none transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "--- Ninguno ---" }),
                teams.map((t) => /* @__PURE__ */ jsxs("option", { value: t.number, children: [
                  t.number,
                  " - ",
                  t.name
                ] }, t.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 min-w-[140px]", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleRevealStep(award),
              disabled: !award.teamNumber,
              className: `flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-20 disabled:grayscale ${award.revealedWinner ? "bg-red-600 text-white shadow-lg" : award.revealedTitle ? "bg-amber-500 text-white shadow-lg" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`,
              children: !award.revealedTitle ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
                " Mostrar Título"
              ] }) : !award.revealedWinner ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }),
                " Revelar Ganador"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }),
                " Ocultar Todo"
              ] })
            }
          ),
          award.revealedTitle && /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-1", children: [
            /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${award.revealedTitle ? "bg-amber-500 animate-pulse" : "bg-slate-800"}` }),
            /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${award.revealedWinner ? "bg-amber-500 animate-pulse" : "bg-slate-800"}` })
          ] })
        ] })
      ] }) }, award.id)) }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx(Megaphone, { className: "text-blue-500 w-5 h-5" }),
            /* @__PURE__ */ jsx("h3", { className: "font-black uppercase tracking-widest text-sm text-white", children: "Anuncio Global" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: awardsData?.announcement?.text || "",
                onChange: (e) => setAwardsData({ ...awardsData, announcement: { ...awardsData.announcement, text: e.target.value } }),
                className: "w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-5 py-4 text-sm text-white font-medium focus:border-blue-500 outline-none min-h-[150px] transition-all",
                placeholder: "Escribe el mensaje aquí..."
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleAnnouncementUpdate({ text: awardsData?.announcement?.text }),
                  className: "flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                    "Guardar"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleAnnouncementUpdate({ active: !awardsData?.announcement?.active }),
                  className: `flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border-2 ${awardsData?.announcement?.active ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"}`,
                  children: [
                    awardsData?.announcement?.active ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
                    awardsData?.announcement?.active ? "En Pantalla" : "Mostrar"
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/10 border border-amber-500/20 rounded-[40px] p-8", children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-amber-500 font-black uppercase tracking-widest text-[11px] mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "w-4 h-4" }),
            "Pasos para Premiar"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "text-slate-400 text-xs space-y-3 leading-relaxed", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-amber-500 font-bold", children: "1." }),
              "Asigna el ganador en la lista."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-amber-500 font-bold", children: "2." }),
              "Haz clic en ",
              /* @__PURE__ */ jsx("strong", { children: "Mostrar Título" }),
              " para que el público sepa qué premio se entrega."
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-amber-500 font-bold", children: "3." }),
              "Haz clic en ",
              /* @__PURE__ */ jsx("strong", { children: "Revelar Ganador" }),
              " para mostrar el equipo y lanzar el confeti."
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}

function QualisSection() {
  const [qualisData, setQualisData] = useState({ matches: [], currentIndex: -1, enabled: false });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchQualis();
    socket.on("qualisUpdate", (data) => {
      setQualisData(data);
    });
    return () => {
      socket.off("qualisUpdate");
    };
  }, []);
  const fetchQualis = async () => {
    try {
      const res = await fetch("/api/qualis");
      if (res.ok) {
        const data = await res.json();
        setQualisData(data);
      }
    } catch (error) {
      console.error("Error fetching qualis:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        const matches = Array.isArray(json) ? json : json.matches || [];
        const response = await fetch("/api/qualis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matches, currentIndex: 0 })
        });
        if (response.ok) {
          toast.success("Matches de Qualis cargados correctamente");
        } else {
          toast.error("Error al guardar los matches");
        }
      } catch (error) {
        toast.error("Archivo JSON inválido");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };
  const handleNext = () => socket.emit("nextQualisMatch");
  const handlePrev = () => socket.emit("prevQualisMatch");
  const handleReset = async () => {
    if (confirm("¿Estás seguro de resetear el modo Qualis?")) {
      await fetch("/api/qualis/reset", { method: "POST" });
      toast.info("Modo Qualis reseteado");
    }
  };
  const toggleQualis = async () => {
    const response = await fetch("/api/qualis/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !qualisData.enabled })
    });
    if (response.ok) {
      toast.success(qualisData.enabled ? "Modo Qualis DESACTIVADO" : "Modo Qualis ACTIVADO");
    }
  };
  const setWinner = async (winner) => {
    if (qualisData.currentIndex === -1) return;
    await fetch(`/api/qualis/match/${qualisData.currentIndex}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner: winner || null })
    });
    toast.success(winner ? `Ganador declarado: ${winner}` : "Ganador reseteado");
  };
  if (loading) return /* @__PURE__ */ jsx("div", { className: "p-8 text-white", children: "Cargando Qualis..." });
  const currentMatch = qualisData.matches[qualisData.currentIndex];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black uppercase tracking-tighter text-white", children: "Modo Qualis" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs font-bold uppercase tracking-widest mt-1", children: "Control del display /timer en modo Qualis" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: toggleQualis,
            className: `flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border-2 ${qualisData.enabled ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"}`,
            children: [
              qualisData.enabled ? /* @__PURE__ */ jsx(EyeOff, { size: 18 }) : /* @__PURE__ */ jsx(Eye, { size: 18 }),
              qualisData.enabled ? "DESACTIVAR EN TIMER" : "ACTIVAR EN TIMER"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-bold transition-all cursor-pointer border border-slate-700", children: [
          /* @__PURE__ */ jsx(Upload, { size: 20 }),
          /* @__PURE__ */ jsx("span", { children: "CARGAR JSON" }),
          /* @__PURE__ */ jsx("input", { type: "file", accept: ".json", onChange: handleFileUpload, className: "hidden" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleReset,
            className: "p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all",
            children: /* @__PURE__ */ jsx(RotateCcw, { size: 20 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-white mb-6 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "text-yellow-500" }),
            " Match Actual"
          ] }),
          qualisData.currentIndex === -1 || !currentMatch ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500", children: [
            /* @__PURE__ */ jsx(FileJson, { size: 48, className: "mx-auto mb-4 opacity-20" }),
            /* @__PURE__ */ jsx("p", { children: "No hay matches cargados o seleccionados" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: `flex-1 p-6 rounded-3xl border transition-all cursor-pointer ${currentMatch.winner === currentMatch.team1 ? "bg-green-600 border-green-400" : "bg-slate-800/50 border-slate-700"}`, onClick: () => setWinner(currentMatch.team1), children: [
                /* @__PURE__ */ jsx("div", { className: "text-slate-500 text-[10px] font-bold uppercase mb-1", children: "TEAM 1" }),
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-white", children: currentMatch.team1 }),
                currentMatch.winner === currentMatch.team1 && /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-white mt-2", children: "GANADOR" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-blue-500", children: "VS" }),
              /* @__PURE__ */ jsxs("div", { className: `flex-1 p-6 rounded-3xl border transition-all cursor-pointer ${currentMatch.winner === currentMatch.team2 ? "bg-green-600 border-green-400" : "bg-slate-800/50 border-slate-700"}`, onClick: () => setWinner(currentMatch.team2), children: [
                /* @__PURE__ */ jsx("div", { className: "text-slate-500 text-[10px] font-bold uppercase mb-1", children: "TEAM 2" }),
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-white", children: currentMatch.team2 }),
                currentMatch.winner === currentMatch.team2 && /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-white mt-2", children: "GANADOR" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-4", children: /* @__PURE__ */ jsx("button", { onClick: () => setWinner(null), className: "w-full py-2 text-xs font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest", children: "Limpiar Ganador" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4 pt-4", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handlePrev,
                  disabled: qualisData.currentIndex <= 0,
                  className: "flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all",
                  children: [
                    /* @__PURE__ */ jsx(ChevronLeft, {}),
                    " ANTERIOR"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleNext,
                  disabled: qualisData.currentIndex >= qualisData.matches.length - 1,
                  className: "flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20",
                  children: [
                    "SIGUIENTE ",
                    /* @__PURE__ */ jsx(ChevronRight, {})
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-[40px] p-8", children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-blue-500 font-black uppercase tracking-widest text-[11px] mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "w-4 h-4" }),
            "Instrucciones Qualis"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "text-slate-400 text-xs space-y-3 leading-relaxed", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              "• Haz clic en la tarjeta de un equipo para declararlo ",
              /* @__PURE__ */ jsx("strong", { children: "ganador" }),
              "."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "• Activa el modo para que se vea en todas las pantallas ",
              /* @__PURE__ */ jsx("strong", { children: "/timer" }),
              "."
            ] }),
            /* @__PURE__ */ jsx("li", { children: "• El avance de match sincroniza automáticamente el display." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl overflow-hidden flex flex-col h-[600px]", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-white mb-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "text-blue-500" }),
          " Lista de Matches (",
          qualisData.matches.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto pr-4 space-y-2 custom-scrollbar", children: qualisData.matches.map((m, idx) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `p-4 rounded-2xl border transition-all ${idx === qualisData.currentIndex ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/20" : "bg-slate-800/40 border-slate-700 hover:bg-slate-800"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-black px-2 py-1 rounded-md ${idx === qualisData.currentIndex ? "bg-white text-blue-600" : "bg-slate-700 text-slate-400"}`, children: [
                  "MATCH ",
                  idx + 1
                ] }),
                m.winner && /* @__PURE__ */ jsx(Trophy, { size: 14, className: idx === qualisData.currentIndex ? "text-white" : "text-yellow-500" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-2 font-bold text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: idx === qualisData.currentIndex ? "text-white" : "text-slate-300", children: m.team1 }),
                /* @__PURE__ */ jsx("span", { className: idx === qualisData.currentIndex ? "text-blue-200" : "text-slate-500", children: "vs" }),
                /* @__PURE__ */ jsx("span", { className: idx === qualisData.currentIndex ? "text-white" : "text-slate-300", children: m.team2 })
              ] })
            ]
          },
          idx
        )) })
      ] })
    ] })
  ] });
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    checkAuth();
    fetchData();
    socket.on("usersUpdate", fetchData);
    socket.on("teamsUpdate", fetchData);
    socket.on("matchesUpdate", fetchData);
    return () => {
      socket.off("usersUpdate", fetchData);
      socket.off("teamsUpdate", fetchData);
      socket.off("matchesUpdate", fetchData);
    };
  }, []);
  const checkAuth = () => {
    const isAuth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("role");
    if (!isAuth || role !== "admin") {
      window.location.href = "/auth/login";
    }
  };
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    try {
      const [u, t, m] = await Promise.all([
        fetch("/api/users", { headers }),
        fetch("/api/teams", { headers }),
        fetch("/api/matches", { headers })
      ]);
      if (u.ok) setUsers(await u.json());
      if (t.ok) setTeams(await t.json());
      if (m.ok) setMatches(await m.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return /* @__PURE__ */ jsx("div", { className: "p-10", children: "Cargando..." });
  return /* @__PURE__ */ jsxs(DashboardLayout, { activeTab, setActiveTab, children: [
    /* @__PURE__ */ jsx(ToastContainer, { position: "top-right", autoClose: 3e3, theme: "dark" }),
    activeTab === "users" && /* @__PURE__ */ jsx(UsersSection, { users, refresh: fetchData }),
    activeTab === "teams" && /* @__PURE__ */ jsx(TeamsSection, { teams, refresh: fetchData }),
    activeTab === "matches" && /* @__PURE__ */ jsx(MatchesSection, {}),
    activeTab === "scores" && /* @__PURE__ */ jsx(ScoresSection, {}),
    activeTab === "awards" && /* @__PURE__ */ jsx(AwardsSection, {}),
    activeTab === "screens" && /* @__PURE__ */ jsx(ScreensSection, {}),
    activeTab === "qualis" && /* @__PURE__ */ jsx(QualisSection, {})
  ] });
}

const $$AdminDashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "LEGO Timer - Admin Dashboard" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Admin", AdminDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/displays/admin/AdminDashboard", "client:component-export": "default" })} ` })}`;
}, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/roles/admin/admin_dashboard.astro", void 0);

const $$file = "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/roles/admin/admin_dashboard.astro";
const $$url = "/roles/admin/admin_dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$AdminDashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
