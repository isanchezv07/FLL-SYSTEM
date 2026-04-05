/* empty css               */
import { c as createComponent } from './astro-component_BB6JYyY2.mjs';
import 'piccolore';
import { p as renderComponent, r as renderTemplate, m as maybeRenderHead } from './server_DKuyG52f.mjs';
import { $ as $$Layout } from './Layout_CMkmN2ym.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as socket } from './socket_CUH3mwX1.mjs';

const SoundDisplay = () => {
  const [volume, setVolume] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [displayStatus, setDisplayStatus] = useState("READY");
  const [logs, setLogs] = useState([]);
  const [displayVolume, setDisplayVolume] = useState(0);
  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      if (volume > displayVolume) {
        setDisplayVolume(volume);
      } else {
        setDisplayVolume((prev) => Math.max(0, prev - 1.5));
      }
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [volume, displayVolume]);
  const addLog = (msg) => {
    setLogs((prev) => [msg, ...prev].slice(0, 2));
  };
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      addLog("CONECTADO");
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setVolume(0);
      addLog("DESCONECTADO");
    };
    const onVolumeUpdate = (v) => typeof v === "number" && setVolume(v);
    const onStatusUpdate = (s) => setDisplayStatus(s);
    if (socket.connected) onConnect();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("volume_update", onVolumeUpdate);
    socket.on("display_status_update", onStatusUpdate);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("volume_update", onVolumeUpdate);
      socket.off("display_status_update", onStatusUpdate);
    };
  }, []);
  const segments = Array.from({ length: 40 }).reverse();
  return /* @__PURE__ */ jsxs("div", { className: "w-80 bg-[#1a1a1a] p-8 rounded-[2rem] border-[10px] border-[#252525] shadow-2xl flex flex-col items-center gap-6 font-sans select-none", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full flex justify-between items-end border-b border-white/10 pb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase", children: "Monitor" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-gray-100 tracking-tighter", children: "VU-METER" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `h-2 w-2 rounded-full shadow-[0_0_10px] ${isConnected ? "bg-green-500 shadow-green-500" : "bg-red-500 animate-pulse shadow-red-500"}` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 h-[400px] items-stretch", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between py-1 text-[10px] font-mono text-gray-500 font-bold", children: [
        /* @__PURE__ */ jsx("span", { children: "100" }),
        /* @__PURE__ */ jsx("span", { children: "80" }),
        /* @__PURE__ */ jsx("span", { children: "60" }),
        /* @__PURE__ */ jsx("span", { children: "40" }),
        /* @__PURE__ */ jsx("span", { children: "20" }),
        /* @__PURE__ */ jsx("span", { className: "text-blue-500", children: "0" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative w-16 bg-black rounded-lg border-2 border-gray-800 p-1 flex flex-col gap-[2px] shadow-inner", children: segments.map((_, i) => {
        const segmentValue = (39 - i) * 2.5;
        const isActive = displayVolume >= segmentValue;
        let colorClass = "bg-gray-900";
        if (isActive) {
          if (segmentValue > 85) colorClass = "bg-red-500 shadow-[0_0_8px_#ef4444]";
          else if (segmentValue > 60) colorClass = "bg-yellow-400 shadow-[0_0_8px_#facc15]";
          else colorClass = "bg-green-500 shadow-[0_0_8px_#22c55e]";
        }
        return /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex-1 w-full rounded-sm transition-colors duration-150 ${colorClass}`
          },
          i
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-end", children: /* @__PURE__ */ jsx("div", { className: "w-1 bg-gray-800 h-full rounded-full overflow-hidden relative", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute bottom-0 w-full bg-blue-500 transition-all duration-75",
          style: { height: `${volume}%` }
        }
      ) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "w-full bg-black/50 rounded-xl p-4 border border-white/5 flex flex-col items-center shadow-inner", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-gray-500 font-bold tracking-[0.2em] mb-1", children: "CURRENT GAIN" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: `text-5xl font-mono font-black tabular-nums transition-colors ${volume > 90 ? "text-red-500" : "text-blue-400"}`, children: Math.round(volume).toString().padStart(2, "0") }),
        /* @__PURE__ */ jsx("span", { className: "text-blue-900 font-bold text-xl", children: "%" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "w-full flex justify-between text-[9px] font-mono text-gray-600", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: displayStatus === "LIVE" ? "text-yellow-600" : "", children: [
          "● ",
          displayStatus
        ] }),
        /* @__PURE__ */ jsx("span", { children: "|" }),
        /* @__PURE__ */ jsx("span", { children: logs[0] || "IDLE" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "uppercase", children: "CH_01_INPUT" })
    ] })
  ] });
};

const $$Sound = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Display de Sonido", "data-astro-cid-jku2oqno": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen flex items-center justify-center bg-black overflow-hidden relative" data-astro-cid-jku2oqno>  <div class="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" data-astro-cid-jku2oqno></div> <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" data-astro-cid-jku2oqno></div> <div class="z-10 w-full flex justify-center p-6" data-astro-cid-jku2oqno> ${renderComponent($$result2, "SoundDisplay", SoundDisplay, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/displays/sound/SoundDisplay", "client:component-export": "default", "data-astro-cid-jku2oqno": true })} </div> </main> ` })}`;
}, "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/displays/sound.astro", void 0);

const $$file = "/Users/mb/Documents/Dev/FLL/FLL-SYSTEM/src/pages/displays/sound.astro";
const $$url = "/displays/sound";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Sound,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
