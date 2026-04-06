/* empty css               */
import { c as createComponent } from './astro-component_rpgzD8Yj.mjs';
import 'piccolore';
import { o as renderHead, p as renderComponent, r as renderTemplate } from './server_C7koQ5Qg.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as socket } from './socket_DUW15NU_.mjs';
import { m as missionBounds, M as MatchTimer, a as missionValueFromMissionsFlat, b as missionValueToPatch } from './MatchTimer_CK6rOva0.mjs';
import { Zap, ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

const getActiveMatchId$1 = () => {
  try {
    return localStorage.getItem("activeMatchId");
  } catch {
    return null;
  }
};
const getActiveTeam = () => {
  try {
    return localStorage.getItem("activeTeam");
  } catch {
    return null;
  }
};
const safeFetchJson$1 = async (url, init) => {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return await res.json();
};
function FLLMissionCounter({ mission, title, subtitle, images, valueLabel }) {
  const bounds = missionBounds[mission];
  const label = valueLabel ?? "Pts";
  const [matchId, setMatchId] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);
  const [match, setMatch] = useState(null);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const mId = getActiveMatchId$1();
    const tId = getActiveTeam();
    if (!mId || !tId) return;
    setLoading(true);
    try {
      const data = await safeFetchJson$1(`/api/matches/${mId}`);
      setMatch(data);
      const teamMissions = data[`missions${tId}`];
      setValue(missionValueFromMissionsFlat(mission, teamMissions));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setMatchId(getActiveMatchId$1());
    setActiveTeam(getActiveTeam());
  }, []);
  useEffect(() => {
    if (!matchId) return;
    load();
    const handler = () => load();
    socket.on("matchesUpdate", handler);
    return () => {
      socket.off("matchesUpdate", handler);
    };
  }, [matchId, mission]);
  const commit = async (nextVal) => {
    if (!matchId || !activeTeam) return;
    const patch = missionValueToPatch(mission, nextVal);
    const key = `missions${activeTeam}`;
    await safeFetchJson$1(`/api/matches/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: patch })
    });
  };
  const onUpdate = async (delta) => {
    const next = Math.max(bounds.min, Math.min(bounds.max, value + delta));
    setValue(next);
    try {
      await commit(next);
    } catch {
      load();
    }
  };
  const onSetMax = async () => {
    setValue(bounds.max);
    try {
      await commit(bounds.max);
    } catch {
      load();
    }
  };
  const onSetMin = async () => {
    setValue(bounds.min);
    try {
      await commit(bounds.min);
    } catch {
      load();
    }
  };
  const isAtMax = value === bounds.max && bounds.max > 0;
  const teamName = match && activeTeam ? match[`team${activeTeam}`] : `Equipo ${activeTeam}`;
  if (!matchId || !activeTeam) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-6 bg-[#020617]", children: /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border-2 border-red-500/20 p-12 rounded-[48px] text-center max-w-sm backdrop-blur-xl", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30", children: /* @__PURE__ */ jsx(Zap, { className: "text-red-500 w-10 h-10" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-red-400 font-black uppercase tracking-[0.3em] text-sm mb-8", children: "Session Expired" }),
      /* @__PURE__ */ jsx("a", { href: "/roles/referee/ref", className: "block bg-red-600 hover:bg-red-500 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95", children: "Reconfigure" })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#020617] text-white p-4 md:p-8 animate-in fade-in duration-500", children: /* @__PURE__ */ jsxs("div", { className: "max-w-xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("a", { href: "/roles/referee/ref", className: "group flex items-center gap-3 bg-slate-900/50 hover:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-800 transition-all active:scale-95", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4 text-slate-400 group-hover:text-white" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white", children: "Back to Map" })
      ] }),
      /* @__PURE__ */ jsx(MatchTimer, {})
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/40 rounded-[40px] border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "p-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" }),
      /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6 text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-blue-500 rounded-full animate-pulse" }),
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]", children: [
            "Mission Control #",
            match?.position || "—"
          ] })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black uppercase tracking-tighter leading-none", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-bold uppercase tracking-[0.2em]", children: subtitle })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-4 pb-4 grid grid-cols-2 gap-3", children: images.map((src, idx) => /* @__PURE__ */ jsx("div", { className: "bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 aspect-square flex items-center justify-center", children: /* @__PURE__ */ jsx("img", { src, alt: "Ref", className: "w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700" }) }, `${src}-${idx}`)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/80 rounded-[48px] border border-slate-800 p-8 md:p-10 shadow-2xl space-y-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]", children: "Active Alliance Table" }),
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 bg-slate-950 px-6 py-2 rounded-2xl border border-slate-800", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-400 font-black text-lg", children: activeTeam }),
          /* @__PURE__ */ jsx("div", { className: "w-px h-4 bg-slate-800" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-white uppercase tracking-tight truncate max-w-[180px]", children: teamName || "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-around", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onUpdate(-1),
            disabled: loading || value <= bounds.min,
            className: "w-24 h-24 rounded-3xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white font-light text-6xl shadow-xl border-b-8 border-slate-950 transition-all disabled:opacity-10",
            children: "-"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("div", { className: `text-9xl font-black tabular-nums leading-none transition-all duration-500 ${isAtMax ? "text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.6)] scale-110" : "text-blue-500"}`, children: loading ? "..." : value }),
          /* @__PURE__ */ jsx("div", { className: `text-[10px] font-black uppercase tracking-[0.4em] mt-4 ${isAtMax ? "text-emerald-500" : "text-slate-600"}`, children: label })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onUpdate(1),
            disabled: loading || value >= bounds.max,
            className: "w-24 h-24 rounded-3xl bg-blue-600 hover:bg-blue-500 active:scale-90 text-white font-light text-6xl shadow-xl border-b-8 border-blue-800 transition-all disabled:opacity-10",
            children: "+"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onSetMin,
            className: "group flex items-center justify-center gap-3 bg-slate-950/50 hover:bg-slate-950 py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 hover:text-white border border-slate-800 transition-all active:scale-95",
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "w-4 h-4 text-slate-700 group-hover:text-red-500" }),
              "Reset Score"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onSetMax,
            className: `group flex items-center justify-center gap-3 py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 border ${isAtMax ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"}`,
            children: [
              /* @__PURE__ */ jsx(Trophy, { className: `w-4 h-4 ${isAtMax ? "text-white animate-bounce" : "text-emerald-500"}` }),
              "Complete Max"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}

const getActiveMatchId = () => {
  try {
    return localStorage.getItem("activeMatchId");
  } catch {
    return null;
  }
};
const isYes = (v) => v === "yes" || v === true;
const safeFetchJson = async (url, init) => {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return await res.json();
};
function Mission1() {
  const [matchId, setMatchId] = useState(null);
  const [inspectionA, setInspectionA] = useState(false);
  const [inspectionB, setInspectionB] = useState(false);
  const [loadingInspection, setLoadingInspection] = useState(true);
  const loadInspection = async () => {
    if (!matchId) return;
    setLoadingInspection(true);
    try {
      const match = await safeFetchJson(`/api/matches/${matchId}`);
      setInspectionA(isYes(match?.missionsA?.inspection));
      setInspectionB(isYes(match?.missionsB?.inspection));
    } finally {
      setLoadingInspection(false);
    }
  };
  useEffect(() => {
    setMatchId(getActiveMatchId());
  }, []);
  useEffect(() => {
    if (!matchId) return;
    loadInspection();
    const handler = () => loadInspection();
    socket.on("matchesUpdate", handler);
    return () => {
      socket.off("matchesUpdate", handler);
    };
  }, [matchId]);
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "1",
      title: "Misión 01",
      subtitle: "Surface Brushing",
      images: ["/missions/mission1_1.webp", "/missions/mission1_2.webp"],
      valueLabel: "Soil/Brush (0..6)"
    }
  ) });
}

function Mission2() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "2",
      title: "Misión 02",
      subtitle: "Map Reveal",
      images: [
        "/missions/mission2_1.webp",
        "/missions/mission2_2.webp",
        "/missions/mission2_3.webp",
        "/missions/mission2_4.webp"
      ],
      valueLabel: "Sections"
    }
  );
}

function Mission34() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "3-4",
      title: "Misión 03-04",
      subtitle: "Mineshaft Explorer & Careful Recovery",
      images: [
        "/missions/mission3-4_1.webp",
        "/missions/mission3-4_2.webp",
        "/missions/mission3-4_3.webp",
        "/missions/mission3-4_4.webp"
      ],
      valueLabel: "Total x10 pts"
    }
  );
}

function Mission5() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "5",
      title: "Misión 05",
      subtitle: "Who Lived Here?",
      images: ["/missions/mission5_1.webp", "/missions/mission5_2.webp"],
      valueLabel: "(0/1)"
    }
  );
}

function Mission6() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "6",
      title: "Misión 06",
      subtitle: "Forge",
      images: ["/missions/mission6_1.webp", "/missions/mission6_2.webp"],
      valueLabel: "Ores (0..2)"
    }
  );
}

function Mission7() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "7",
      title: "Misión 07",
      subtitle: "Heavy Lifting",
      images: ["/missions/mission7_1.webp", "/missions/mission7_2.webp"],
      valueLabel: "(0/1)"
    }
  );
}

function Mission8() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "8",
      title: "Misión 08",
      subtitle: "Silo",
      images: ["/missions/mission8_1.avif"],
      valueLabel: "Pieces (0..4)"
    }
  );
}

function Mission9() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "9",
      title: "Misión 09",
      subtitle: "What's on Sale?",
      images: ["/missions/mission9_1.webp", "/missions/mission9_2.webp", "/missions/mission9_3.webp"],
      valueLabel: "Roof/Wares (0..3)"
    }
  );
}

function Mission10() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "10",
      title: "Misión 10",
      subtitle: "Tip the Scales",
      images: ["/missions/mission10_1.webp", "/missions/mission10_2.webp"],
      valueLabel: "Tipped/Pan (0..3)"
    }
  );
}

function Mission11() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "11",
      title: "Misión 11",
      subtitle: "Angler Artifacts",
      images: ["/missions/mission11_1.webp", "/missions/mission11_2.webp"],
      valueLabel: "Raised/Flag (0..3)"
    }
  );
}

function Mission12() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "12",
      title: "Misión 12",
      subtitle: "Salvage Operation",
      images: ["/missions/mission12_1.webp", "/missions/mission12_2.webp", "/missions/mission12_3.webp"],
      valueLabel: "Sand/Ship (0..3)"
    }
  );
}

function Mission13() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "13",
      title: "Misión 13",
      subtitle: "Statue Rebuild",
      images: ["/missions/mission13_1.webp", "/missions/mission13_2.webp"],
      valueLabel: "(0/1)"
    }
  );
}

function Mission14() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "14",
      title: "Misión 14",
      subtitle: "Forum",
      images: ["/missions/mission14_1.webp", "/missions/mission14_2.webp"],
      valueLabel: "Artifacts (0..8)"
    }
  );
}

function Mission15() {
  return /* @__PURE__ */ jsx(
    FLLMissionCounter,
    {
      mission: "15",
      title: "Misión 15",
      subtitle: "Site Marking (Precision Tokens)",
      images: ["/missions/mission15_1.webp", "/missions/mission15_2.webp", "/missions/mission15_3.webp"],
      valueLabel: "Tokens (0..6)"
    }
  );
}

const misiones = {
  "1": Mission1,
  "2": Mission2,
  "3": Mission34,
  "4": Mission34,
  "5": Mission5,
  "6": Mission6,
  "7": Mission7,
  "8": Mission8,
  "9": Mission9,
  "10": Mission10,
  "11": Mission11,
  "12": Mission12,
  "13": Mission13,
  "14": Mission14,
  "15": Mission15
};
const MisionSelector = ({ id }) => {
  const Componente = misiones[id];
  if (!Componente) {
    return /* @__PURE__ */ jsx("div", { style: { padding: "40px", textAlign: "center", border: "2px dashed #ccc", borderRadius: "10px" }, children: /* @__PURE__ */ jsx("p", { style: { color: "#666", fontSize: "18px" }, children: "Herramienta en construcción 🚧" }) });
  }
  return /* @__PURE__ */ jsx(Componente, {});
};

const $$id = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const { title, points, desc } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderHead()}</head> <body> ${renderComponent($$result, "MisionSelector", MisionSelector, { "id": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/missions/MissionSelector", "client:component-export": "default" })} </body></html>`;
}, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/misiones/[id].astro", void 0);

const $$file = "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/misiones/[id].astro";
const $$url = "/misiones/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
