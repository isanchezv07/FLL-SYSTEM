import React, { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import MatchTimer from "@/components/game/MatchTimer";
import { Monitor, ChevronRight, Hash, Users, Map as MapIcon, RotateCcw } from "lucide-react";

const mapMarkers = [
  { id: "1", top: "40%", left: "5%", title: "Misión 01: Surface Brushing" },
  { id: "2", top: "11%", left: "9.6%", title: "Misión 02: Map Reveal" },
  { id: "3", top: "7%", left: "33%", title: "Misión 03: Mineshaft Explorer" },
  { id: "4", top: "18%", left: "29%", title: "Misión 04: Careful Recovery" },
  { id: "5", top: "7.5%", left: "80.5%", title: "Misión 05: Who Lived Here?" },
  { id: "6", top: "20%", left: "87.8%", title: "Misión 06: Forge" },
  { id: "7", top: "8%", left: "94.5%", title: "Misión 07: Heavy Lifting" },
  { id: "8", top: "40%", left: "94%", title: "Misión 08: Silo" },
  { id: "9", top: "43%", left: "70.3%", title: "Misión 09: What's on Sale?" },
  { id: "10", top: "48.3%", left: "60.8%", title: "Misión 10: Tip the Scales" },
  { id: "11", top: "93.5%", left: "60.3%", title: "Misión 11: Angler Artifacts" },
  { id: "12", top: "93.5%", left: "45.3%", title: "Misión 12: Salvage Operation" },
  { id: "13", top: "41.8%", left: "42.6%", title: "Misión 13: Statue Rebuild" },
  { id: "14", top: "46.4%", left: "33.8%", title: "Misión 14: Forum" },
  { id: "15", top: "67%", left: "14.7%", title: "Misión 15: Site Marking" }
];

export default function InteractiveMap() {
  const [matches, setMatches] = useState<any[]>([]);
  const [timerState, setTimerState] = useState<any>({ fields: {} });
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    fetchMatches();
    const storedMatchId = localStorage.getItem("activeMatchId");
    const storedTeam = localStorage.getItem("activeTeam");
    if (storedMatchId && storedTeam) {
      setSelectedMatchId(storedMatchId);
      setSelectedTeam(storedTeam);
      setIsConfigured(true);
    }
    socket.on("matchesUpdate", fetchMatches);
    socket.on("timerUpdate", (data) => setTimerState(data));
    socket.emit("getTimer");
    return () => { 
      socket.off("matchesUpdate", fetchMatches); 
      socket.off("timerUpdate");
    };
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data || []);
    } catch (e) { console.error(e); }
  };

  const handleConfirm = () => {
    if (selectedMatchId && selectedTeam) {
      localStorage.setItem("activeMatchId", selectedMatchId);
      localStorage.setItem("activeTeam", selectedTeam);
      setIsConfigured(true);
    }
  };

  const currentMatch = matches.find(m => m.id === selectedMatchId);

  if (!isConfigured) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[48px] border border-slate-800 p-8 md:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/30">
              <Monitor className="text-blue-400 w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Setup Referee</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Configure match & alliance</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <Hash className="w-3 h-3 text-blue-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select match</label>
              </div>
              <select 
                value={selectedMatchId} 
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full bg-slate-950/50 p-5 rounded-[24px] border-2 border-slate-800 focus:border-blue-500 outline-none font-black text-white shadow-inner transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Seleccionar Partido Activo --</option>
                
                {/* 1. Partidos asignados a canchas por el admin */}
                <optgroup label="🔴 EN CANCHA (ASIGNADOS)">
                  {Object.entries(timerState.fields || {}).map(([f, mId]) => {
                    if (!mId) return null;
                    const m = matches.find(match => match.id === mId);
                    if (!m) return null;
                    return (
                      <option key={`field-${m.id}`} value={m.id}>
                        {f.replace('cancha', 'CANCHA ')}: Match #{m.position} ({m.teamA1} vs {m.teamB1})
                      </option>
                    );
                  })}
                </optgroup>

                {/* 2. Partidos marcados como 'in_progress' pero quizás no asignados a cancha física */}
                <optgroup label="⏱️ OTROS PARTIDOS ACTIVOS">
                  {matches
                    .filter(m => m.status === 'in_progress' && !Object.values(timerState.fields).includes(m.id))
                    .map(m => (
                      <option key={`active-${m.id}`} value={m.id}>
                        Match #{m.position} • Ronda {m.round}
                      </option>
                    ))
                  }
                </optgroup>

                {matches.filter(m => m.status === 'in_progress' || Object.values(timerState.fields).includes(m.id)).length === 0 && (
                  <option disabled>No hay partidos activos. Espera al Admin.</option>
                )}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <Users className="w-3 h-3 text-blue-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Alliance Table</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['A1', 'A2', 'B1', 'B2'].map(t => {
                  const teamName = matches.find(m => m.id === selectedMatchId)?.[`team${t}`];
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTeam(t)}
                      className={`group p-6 rounded-[24px] font-black transition-all border-2 text-left shadow-lg active:scale-95 ${
                        selectedTeam === t 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-blue-600/20' 
                          : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className={`text-[10px] uppercase tracking-widest mb-1 ${selectedTeam === t ? 'text-blue-200' : 'text-slate-600'}`}>Table {t}</div>
                      <div className="text-sm uppercase tracking-tight truncate">{teamName || 'Empty'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedMatchId || !selectedTeam}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-20 disabled:grayscale py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:translate-y-1"
            >
              Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 flex flex-wrap items-center gap-4 bg-slate-900/50 backdrop-blur-xl p-6 rounded-[32px] border border-slate-800 shadow-xl">
          <MatchTimer />
          <div className="h-10 w-px bg-slate-800 mx-2 hidden sm:block" />
          <div className="flex gap-4">
            <div className="bg-slate-950 px-5 py-2.5 rounded-[20px] border border-slate-800 shadow-inner">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Match</div>
              <div className="text-xl font-black text-blue-400 tabular-nums leading-none">#{currentMatch?.position || '—'}</div>
            </div>
            <div className="bg-slate-950 px-5 py-2.5 rounded-[20px] border border-slate-800 shadow-inner">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Table</div>
              <div className="text-xl font-black text-blue-400 leading-none">{selectedTeam}</div>
            </div>
          </div>
          <div className="flex-1 min-w-[150px] hidden md:block pl-4">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Active Team</div>
            <div className="text-sm font-black text-white uppercase tracking-tight truncate">{currentMatch?.[`team${selectedTeam}`] || '—'}</div>
          </div>
          <button 
            onClick={() => setIsConfigured(false)}
            className="flex items-center gap-2 text-[9px] font-black bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 px-5 py-3 rounded-[18px] uppercase tracking-[0.15em] transition-all border border-slate-700 active:scale-95"
          >
            <RotateCcw className="w-3 h-3" /> Change
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative overflow-hidden rounded-[48px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] bg-slate-950 border-4 border-slate-900">
          <img src="/field.png" alt="FLL Field" className="w-full h-auto block" />
          {mapMarkers.map((marker) => (
            <a
              key={marker.id}
              href={`/misiones/${marker.id}`}
              className="absolute group/marker"
              style={{ top: marker.top, left: marker.left, width: '7%', height: '9%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-full h-full rounded-full border-2 border-blue-500/0 group-hover/marker:border-blue-400 group-hover/marker:bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0)] group-hover/marker:shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 " />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4 pb-12">
        {mapMarkers.map((marker) => (
          <a
            key={marker.id}
            href={`/misiones/${marker.id}`}
            className="flex flex-col items-center justify-center aspect-square bg-slate-900 border border-slate-800 rounded-[24px] hover:border-blue-500 hover:bg-slate-800 transition-all shadow-lg active:scale-90 group"
          >
            <span className="text-xl font-black text-slate-600 group-hover:text-blue-400 transition-colors">{marker.id}</span>
            <span className="text-[8px] font-black text-slate-700 group-hover:text-blue-500 uppercase tracking-widest mt-1">Goal</span>
          </a>
        ))}
      </div>
    </div>
  );
}
