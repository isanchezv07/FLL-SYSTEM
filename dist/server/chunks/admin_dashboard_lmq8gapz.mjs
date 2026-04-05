/* empty css               */
import { c as createComponent } from './astro-component_BB6JYyY2.mjs';
import 'piccolore';
import { o as renderHead, p as renderComponent, r as renderTemplate } from './server_DKuyG52f.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { M as MatchTimer, a as missionValueFromMissionsFlat, m as missionBounds, b as missionValueToPatch } from './MatchTimer_Dc-K-arb.mjs';
import { LayoutDashboard, LogOut, Users as Users$1, Settings, Trophy, RefreshCw, UserPlus, User, Key, Shield, Trash2, EyeOff, Eye, Check, Copy, ChevronLeft, ChevronRight, Pause, RotateCcw, Layers, Target, X, Square, Play, Megaphone, Save } from 'lucide-react';
import { s as socket } from './socket_CUH3mwX1.mjs';
import { toast } from 'react-toastify';

const NavButton = ({ id, label, icon: Icon, active, onClick }) => /* @__PURE__ */ jsxs(
  "button",
  {
    onClick: () => onClick(id),
    className: `flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border-2 ${active ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105 z-10" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"}`,
    children: [
      /* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 ${active ? "text-white" : "text-slate-600"}` }),
      label
    ]
  }
);
function DashboardLayout({ activeTab, setActiveTab, children }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30", children: [
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800/50 px-6 py-4 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20", children: /* @__PURE__ */ jsx(LayoutDashboard, { className: "text-white w-6 h-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-lg font-black uppercase tracking-tighter leading-none", children: "FLL SYSTEM" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-blue-500 uppercase tracking-widest", children: "Command Center" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(MatchTimer, {})
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleLogout,
          className: "flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-red-500/20 active:scale-95",
          children: [
            /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
            "Cerrar Sesión"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1600px] mx-auto p-6 lg:p-8", children: [
      /* @__PURE__ */ jsxs("nav", { className: "flex flex-wrap gap-3 mb-8", children: [
        /* @__PURE__ */ jsx(NavButton, { id: "users", label: "Usuarios", icon: Users$1, active: activeTab === "users", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "matches", label: "Partidos", icon: Settings, active: activeTab === "matches", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "scores", label: "Ranking", icon: Trophy, active: activeTab === "scores", onClick: setActiveTab }),
        /* @__PURE__ */ jsx(NavButton, { id: "awards", label: "Premios", icon: Trophy, active: activeTab === "awards", onClick: setActiveTab })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "animate-in fade-in slide-in-from-bottom-4 duration-700", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/40 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm min-h-[700px]", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" }),
        /* @__PURE__ */ jsx("div", { className: "p-8 lg:p-10", children })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none -z-10 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" })
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
  return /* @__PURE__ */ jsxs("div", { className: "space-y-10 animate-in fade-in duration-700", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black text-white tracking-tighter uppercase", children: "Identity Management" }),
        /* @__PURE__ */ jsxs("p", { className: "text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-blue-500 rounded-full animate-pulse" }),
          "Control de accesos y credenciales del sistema"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: refresh,
            className: "p-4 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-2xl border border-slate-800 transition-all active:scale-90",
            title: "Refrescar lista",
            children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowShowForm(!showForm),
            className: `flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-lg ${showForm ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 border border-blue-400/20"}`,
            children: [
              /* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4" }),
              showForm ? "Cerrar Formulario" : "Crear Acceso"
            ]
          }
        )
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsx("div", { className: "bg-slate-900/80 border-2 border-blue-500/20 rounded-[48px] p-10 backdrop-blur-2xl animate-in slide-in-from-top-8 duration-500 shadow-[0_32px_64px_rgba(0,0,0,0.5)]", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-4", children: "Nombre de Usuario" }),
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx(User, { className: "absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              type: "text",
              placeholder: "Ej: mesa_norte_01",
              className: "w-full bg-slate-950 border-2 border-slate-800 p-5 pl-14 rounded-[24px] outline-none focus:border-blue-500 text-white font-black transition-all shadow-inner",
              value: formData.username,
              onChange: (e) => setFormData({ ...formData, username: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-4", children: "Clave de Acceso" }),
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx(Key, { className: "absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              type: "text",
              placeholder: "Contraseña robusta",
              className: "w-full bg-slate-950 border-2 border-slate-800 p-5 pl-14 rounded-[24px] outline-none focus:border-blue-500 text-white font-black transition-all shadow-inner",
              value: formData.password,
              onChange: (e) => setFormData({ ...formData, password: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-4", children: "Nivel de Privilegios" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "flex-1 bg-slate-950 border-2 border-slate-800 p-5 rounded-[24px] outline-none focus:border-blue-500 text-white font-black appearance-none cursor-pointer shadow-inner",
              value: formData.role,
              onChange: (e) => setFormData({ ...formData, role: e.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "ref", children: "Juez de Campo (Referee)" }),
                /* @__PURE__ */ jsx("option", { value: "admin", children: "Administrador Total" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("button", { className: "bg-blue-600 hover:bg-blue-500 text-white px-10 rounded-[24px] font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-blue-950/20 active:scale-95 border-b-4 border-blue-800", children: "Registrar" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: users.map((user) => {
      const isPasswordVisible = visiblePasswords[user.id];
      return /* @__PURE__ */ jsxs("div", { className: "group relative bg-slate-900/60 border border-slate-800 p-8 rounded-[40px] transition-all duration-500 hover:border-slate-600 hover:bg-slate-900 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16 pointer-events-none" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-8", children: [
            /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover:rotate-6 ${user.role === "admin" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-blue-500/10 border-blue-500/30 text-blue-400"}`, children: /* @__PURE__ */ jsx(Shield, { className: "w-7 h-7" }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDelete(user.id),
                className: "p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all",
                title: "Eliminar usuario",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1", children: "User Identifier" }),
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-white uppercase tracking-tighter truncate", children: user.username })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-950/80 p-4 rounded-2xl border border-slate-800/50 flex items-center justify-between group/field", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5", children: "Secure Key" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono font-bold text-slate-300 tracking-wider", children: isPasswordVisible ? user.password : "••••••••" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => togglePassword(user.id),
                      className: "p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors",
                      children: isPasswordVisible ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => copyToClipboard(user.password, user.id + "-pass"),
                      className: "p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-400 transition-colors",
                      children: copiedId === user.id + "-pass" ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-500" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between px-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${user.role === "admin" ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"}` }),
                /* @__PURE__ */ jsx("span", { className: `text-[10px] font-black uppercase tracking-[0.2em] ${user.role === "admin" ? "text-purple-400" : "text-blue-400"}`, children: user.role === "admin" ? "System Admin" : "Field Referee" })
              ] }) })
            ] })
          ] })
        ] })
      ] }, user.id);
    }) })
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
  const [loading, setLoading] = useState(true);
  const [bracketSize, setBracketSize] = useState(8);
  const [bracketMode, setBracketMode] = useState("2vs2");
  const [editingMatchId, setEditingMatchId] = useState(null);
  useEffect(() => {
    fetchMatches();
    const handler = () => fetchMatches();
    socket.on("matchesUpdate", handler);
    return () => {
      socket.off("matchesUpdate", handler);
    };
  }, []);
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
  const createBracket = async () => {
    if (!confirm("¿Generar nuevo bracket? Se borrarán todos los datos actuales.")) return;
    try {
      await fetch("/api/brackets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: bracketSize, mode: bracketMode })
      });
      fetchMatches();
    } catch {
    }
  };
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
  return /* @__PURE__ */ jsxs("div", { className: "space-y-10 pb-20 animate-in fade-in duration-700", children: [
    /* @__PURE__ */ jsx("div", { className: "sticky top-4 z-40 bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-800 rounded-[40px] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col xl:flex-row gap-8 items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-slate-950/50 p-2 rounded-[24px] border border-slate-800/50", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => socket.emit("prevMatch"),
            className: "p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-800",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "px-6 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1", children: "Navigation" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-black text-white tabular-nums tracking-tighter uppercase", children: "Switch Match" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => socket.emit("nextMatch"),
            className: "p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-800",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => socket.emit("startTimer"),
            className: "flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 group",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" }),
              "Launch Engine"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => socket.emit("pauseTimer"),
            className: "p-5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-[24px] border-2 border-amber-500/20 transition-all active:scale-90",
            title: "Pause Timer",
            children: /* @__PURE__ */ jsx(Pause, { className: "w-6 h-6 fill-current" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => socket.emit("resetTimer"),
            className: "p-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[24px] border-2 border-red-500/20 transition-all active:scale-90",
            title: "Reset Timer",
            children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-6 h-6" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-slate-950/50 p-3 rounded-[24px] border border-slate-800/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col px-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 text-center", children: "Mode" }),
          /* @__PURE__ */ jsxs("select", { value: bracketMode, onChange: (e) => setBracketMode(e.target.value), className: "bg-transparent text-blue-400 font-black text-xs outline-none uppercase tracking-widest cursor-pointer", children: [
            /* @__PURE__ */ jsx("option", { value: "1vs1", children: "1 vs 1" }),
            /* @__PURE__ */ jsx("option", { value: "2vs2", children: "2 vs 2" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-px h-8 bg-slate-800" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: bracketSize,
            onChange: (e) => setBracketSize(Number(e.target.value)),
            className: "bg-transparent font-medium focus:outline-none px-2",
            children: [0, 4, 8, 16, 32].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
              "Top ",
              n
            ] }, n))
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: createBracket,
            className: "flex items-center gap-2 bg-slate-800 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all",
            children: [
              /* @__PURE__ */ jsx(Layers, { className: "w-3 h-3" }),
              "New Bracket"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "px-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black text-white uppercase tracking-tighter", children: "Tournament Bracket" }),
        /* @__PURE__ */ jsxs("p", { className: "text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Target, { className: "w-3 h-3 text-blue-500" }),
          "Haz clic en un partido para editar puntajes por misión"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-12 overflow-x-auto pb-12 scrollbar-hide snap-x", children: rounds.map((round) => /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 w-80 space-y-8 snap-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 font-black text-sm text-blue-500 shadow-xl", children: round.number }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]", children: "ROUND PHASE" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: round.matches.map((match) => /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => setEditingMatchId(match.id),
            className: `group relative bg-slate-900/40 border-2 rounded-[32px] p-6 cursor-pointer transition-all duration-500 hover:scale-[1.05] hover:bg-slate-900 shadow-2xl ${match.status === "in_progress" ? "border-blue-500 shadow-blue-500/20 bg-slate-900 animate-pulse-slow" : "border-slate-800 hover:border-slate-700"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "absolute -top-3 left-8 bg-slate-950 px-4 py-1 rounded-full border border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] z-10 group-hover:text-blue-400 transition-colors", children: [
                "MATCH #",
                match.position
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-slate-300 uppercase truncate max-w-[150px]", children: [
                    match.teamA1 || "TBD",
                    " ",
                    match.teamA2 && `+ ${match.teamA2}`
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `font-mono font-black text-2xl ${match.status === "finished" && match.scoreA > match.scoreB ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" : "text-slate-600"}`, children: match.scoreA })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-slate-300 uppercase truncate max-w-[150px]", children: [
                    match.teamB1 || "TBD",
                    " ",
                    match.teamB2 && `+ ${match.teamB2}`
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `font-mono font-black text-2xl ${match.status === "finished" && match.scoreB > match.scoreA ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" : "text-slate-600"}`, children: match.scoreB })
                ] })
              ] })
            ]
          },
          match.id
        )) })
      ] }, round.number)) })
    ] }),
    editingMatch && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-slate-950/95 backdrop-blur-xl", onClick: () => setEditingMatchId(null) }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-7xl h-full max-h-[95vh] bg-slate-900 border border-slate-800 rounded-[60px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-8 lg:p-12 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-8 bg-slate-950/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-8 text-white", children: [
            /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-900/40 border-b-8 border-blue-800", children: /* @__PURE__ */ jsx(Target, { className: "text-white w-10 h-10" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-5xl font-black uppercase tracking-tighter leading-none", children: "Match Inspector" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-3", children: [
                /* @__PURE__ */ jsxs("span", { className: "px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-black text-blue-400 uppercase tracking-widest", children: [
                  "Match #",
                  editingMatch.position
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest", children: [
                  "Round ",
                  editingMatch.round
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-12 bg-slate-950/80 px-12 py-6 rounded-[40px] border-2 border-slate-800 shadow-inner", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1", children: "ALLIANCE A" }),
              /* @__PURE__ */ jsx("div", { className: "text-6xl font-mono font-black text-white", children: editingMatch.scoreA })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-4xl font-black text-slate-800 italic", children: "VS" }),
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1", children: "ALLIANCE B" }),
              /* @__PURE__ */ jsx("div", { className: "text-6xl font-mono font-black text-white", children: editingMatch.scoreB })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setEditingMatchId(null), className: "w-16 h-16 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-3xl transition-all flex items-center justify-center border border-slate-700", children: /* @__PURE__ */ jsx(X, { className: "w-8 h-8" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-10 lg:p-12 space-y-12 scrollbar-thin scrollbar-thumb-slate-800 text-white", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 border-l-4 border-blue-600 pl-6", children: /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black uppercase tracking-tight", children: "Alliance A Control" }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsx(DetailedTeamBox, { team: "A1", name: editingMatch.teamA1, matchId: editingMatch.id, matches, onUpdate: updateMatchMissions, color: "blue" }),
              /* @__PURE__ */ jsx(DetailedTeamBox, { team: "A2", name: editingMatch.teamA2, matchId: editingMatch.id, matches, onUpdate: updateMatchMissions, color: "blue" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 border-l-4 border-red-600 pl-6", children: /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black uppercase tracking-tight", children: "Alliance B Control" }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsx(DetailedTeamBox, { team: "B1", name: editingMatch.teamB1, matchId: editingMatch.id, matches, onUpdate: updateMatchMissions, color: "red" }),
              /* @__PURE__ */ jsx(DetailedTeamBox, { team: "B2", name: editingMatch.teamB2, matchId: editingMatch.id, matches, onUpdate: updateMatchMissions, color: "red" })
            ] })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
function DetailedTeamBox({ team, name, matchId, matches, onUpdate, color }) {
  if (!name) return /* @__PURE__ */ jsxs("div", { className: "bg-slate-950/30 border-2 border-slate-800 border-dashed rounded-[40px] p-12 flex flex-col items-center justify-center text-center opacity-40", children: [
    /* @__PURE__ */ jsx(Users, { className: "w-10 h-10 text-slate-700 mb-4" }),
    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-600 uppercase tracking-widest", children: "No Assignment" })
  ] });
  const match = matches.find((m) => m.id === matchId);
  const missions = match?.[`missions${team}`] || {};
  const missionList = Object.keys(missionBounds);
  const accentColor = color === "blue" ? "blue" : "red";
  return /* @__PURE__ */ jsxs("div", { className: "bg-slate-950/50 border border-slate-800 rounded-[48px] p-8 space-y-8 relative overflow-hidden group", children: [
    /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 w-full h-1 bg-${accentColor}-600/30` }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("span", { className: `text-[9px] font-black uppercase tracking-[0.3em] text-${accentColor}-500 mb-1 block`, children: [
        "Mesa ",
        team
      ] }),
      /* @__PURE__ */ jsx("h4", { className: "text-xl font-black uppercase tracking-tight leading-tight", children: name })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2.5", children: missionList.map((mId) => {
      const val = missionValueFromMissionsFlat(mId, missions);
      const bounds = missionBounds[mId];
      const isMax = val === bounds.max && bounds.max > 0;
      return /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${isMax ? `bg-${accentColor}-600/10 border-${accentColor}-500/30` : "bg-slate-900/40 border-slate-800/50"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-[8px] font-black text-slate-600 uppercase tracking-widest", children: [
            "M",
            mId.padStart(2, "0")
          ] }),
          /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold uppercase tracking-tight ${isMax ? "text-white" : "text-slate-400"}`, children: MISSION_NAMES[mId] || "Unknown" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner text-white", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => onUpdate(matchId, `missions${team}`, mId, -1), disabled: val <= bounds.min, className: "w-8 h-8 bg-slate-800 hover:bg-slate-700 disabled:opacity-10 rounded-lg font-black text-lg transition-all active:scale-90", children: "-" }),
          /* @__PURE__ */ jsx("span", { className: `font-mono font-black text-sm w-6 text-center tabular-nums ${isMax ? `text-${accentColor}-400` : "text-slate-300"}`, children: val }),
          /* @__PURE__ */ jsx("button", { onClick: () => onUpdate(matchId, `missions${team}`, mId, 1), disabled: val >= bounds.max, className: `w-8 h-8 bg-${accentColor}-600 hover:bg-${accentColor}-500 disabled:opacity-10 rounded-lg font-black text-lg transition-all active:scale-90`, children: "+" })
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
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 border-4 border-blue-500/20 rounded-full" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-black uppercase tracking-[0.2em] text-xs", children: "Processing Rankings" })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-700", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black text-white tracking-tighter uppercase", children: "Leaderboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs font-bold uppercase tracking-widest mt-1", children: "Live Tournament Standings" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: fetchScores,
          className: "p-3 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-2xl border border-slate-800 transition-all active:scale-90",
          children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: ranking.length > 0 ? ranking.map((team, index) => {
      const isFirst = index === 0;
      const isTop3 = index < 3;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `group grid grid-cols-12 items-center px-8 py-6 rounded-[32px] border-2 transition-all duration-300 hover:scale-[1.02] ${isFirst ? "bg-blue-600 border-blue-400 shadow-[0_20px_40px_rgba(37,99,235,0.2)] text-white" : isTop3 ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-slate-900/40 border-slate-800/50 text-slate-400"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "col-span-1 flex items-center gap-4", children: /* @__PURE__ */ jsx("span", { className: `font-black text-2xl tabular-nums ${isFirst ? "text-white" : "text-slate-500"}`, children: (index + 1).toString().padStart(2, "0") }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-7 flex items-center gap-6", children: [
              /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-transform group-hover:rotate-12 ${isFirst ? "bg-white text-blue-600" : "bg-slate-800 text-slate-400 border border-slate-700"}`, children: team.team.substring(0, 2).toUpperCase() }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: `font-black uppercase tracking-tight text-lg ${isFirst ? "text-white" : "text-slate-200"}`, children: team.team }),
                /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-bold uppercase tracking-widest ${isFirst ? "text-blue-200" : "text-slate-600"}`, children: [
                  team.matchesPlayed,
                  " Matches Played"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-4 text-right flex flex-col items-end", children: [
              /* @__PURE__ */ jsx("div", { className: `font-mono font-black text-3xl tabular-nums ${isFirst ? "text-white" : "text-blue-400"}`, children: team.total.toLocaleString() }),
              /* @__PURE__ */ jsx("span", { className: `text-[9px] font-black uppercase tracking-[0.2em] ${isFirst ? "text-blue-200" : "text-slate-600"}`, children: "Accumulated Points" })
            ] })
          ]
        },
        team.team
      );
    }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-32 bg-slate-900/20 rounded-[48px] border-4 border-dashed border-slate-800/50", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-800", children: /* @__PURE__ */ jsx(Users$1, { className: "w-10 h-10 text-slate-700" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-black uppercase tracking-widest text-sm", children: "No match data available yet" })
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

const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    checkAuth();
    fetchData();
    const socket = io(`http://${hostname}:3000`);
    socket.on("usersUpdate", fetchData);
    socket.on("matchesUpdate", fetchData);
    return () => socket.disconnect();
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
    const [u, m] = await Promise.all([
      fetch("/api/users", { headers }),
      fetch("/api/matches", { headers })
    ]);
    if (u.ok) setUsers(await u.json());
    if (m.ok) setMatches(await m.json());
    setLoading(false);
  };
  if (loading) return /* @__PURE__ */ jsx("div", { className: "p-10", children: "Cargando..." });
  return /* @__PURE__ */ jsxs(DashboardLayout, { activeTab, setActiveTab, children: [
    activeTab === "users" && /* @__PURE__ */ jsx(UsersSection, { users, refresh: fetchData }),
    activeTab === "matches" && /* @__PURE__ */ jsx(MatchesSection, {}),
    activeTab === "scores" && /* @__PURE__ */ jsx(ScoresSection, {}),
    activeTab === "awards" && /* @__PURE__ */ jsx(AwardsSection, {})
  ] });
}

const $$AdminDashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>LEGO Timer - Admin Dashboard</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@500;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-gray-100 flex flex-col min-h-screen"> <main class="flex-1"> <div class="h-full"> ${renderComponent($$result, "Admin", AdminDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/displays/admin/AdminDashboard", "client:component-export": "default" })} </div> </main> </body></html>`;
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
