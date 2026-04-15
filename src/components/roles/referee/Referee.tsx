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
      <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-500 py-12 px-4">
        {/* Barra decorativa bandera de México */}
        <div className="fixed top-0 left-0 w-full h-1 flex z-[60]">
          <div className="h-full flex-1 bg-[#006847]"></div>
          <div className="h-full flex-1 bg-white"></div>
          <div className="h-full flex-1 bg-[#CE1126]"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] border border-white p-8 md:p-12 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 transform transition-transform hover:scale-105">
              <img src="/img/logo_internacional.svg" alt="FLL Logo" className="h-12 w-auto" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-900 mb-2 italic">
              Setup <span className="text-[#006847]">Ref</span>er<span className="text-[#CE1126]">ee</span>
            </h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Configuración de Mesa y Partido</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <Hash className="w-3 h-3 text-[#006847]" />
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Seleccionar Partido</label>
              </div>
              <div className="relative">
                <select 
                  value={selectedMatchId} 
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-white p-5 rounded-[24px] border border-gray-200 focus:border-[#006847] focus:ring-4 focus:ring-[#006847]/5 outline-none font-bold text-gray-800 shadow-sm transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Seleccionar Partido Activo --</option>
                  
                  <optgroup label="🟢 EN CANCHA (ASIGNADOS)">
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
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <Users className="w-3 h-3 text-[#006847]" />
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mesa de Alianza</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['A1', 'A2', 'B1', 'B2'].map(t => {
                  const teamName = matches.find(m => m.id === selectedMatchId)?.[`team${t}`];
                  const isSelected = selectedTeam === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTeam(t)}
                      className={`group p-6 rounded-[24px] font-bold transition-all border text-left shadow-sm active:scale-95 ${
                        isSelected 
                          ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-900/20' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-[#006847] hover:text-[#006847]'
                      }`}
                    >
                      <div className={`text-[10px] uppercase tracking-widest mb-1 ${isSelected ? 'text-gray-400' : 'text-gray-400 group-hover:text-[#006847]'}`}>Table {t}</div>
                      <div className="text-sm uppercase tracking-tight truncate font-black">{teamName || 'Vacío'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedMatchId || !selectedTeam}
              className="w-full bg-gray-900 hover:bg-black disabled:opacity-20 disabled:grayscale py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm text-white shadow-xl hover:shadow-gray-900/30 transition-all active:translate-y-1 transform hover:-translate-y-1"
            >
              Iniciar Sesión de Referee
            </button>
          </div>
        </div>
        
        {/* Fondo decorativo tech */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#006847]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#CE1126]/5 blur-[120px] rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-6 lg:p-12 space-y-8 animate-in fade-in duration-700 relative overflow-hidden font-sans">
      {/* Barra decorativa bandera de México */}
      <div className="fixed top-0 left-0 w-full h-1 flex z-[60]">
        <div className="h-full flex-1 bg-[#006847]"></div>
        <div className="h-full flex-1 bg-white"></div>
        <div className="h-full flex-1 bg-[#CE1126]"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 flex flex-wrap items-center gap-6 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-xl shadow-gray-200/50">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <img src="/img/logo_internacional.svg" alt="FLL Logo" className="h-10 w-auto" />
          </div>
          <MatchTimer />
          <div className="h-10 w-px bg-gray-200 mx-2 hidden sm:block" />
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-[20px] border border-gray-100 shadow-sm">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Partido</div>
              <div className="text-xl font-black text-[#006847] tabular-nums leading-none">#{currentMatch?.position || '—'}</div>
            </div>
            <div className="bg-white px-5 py-3 rounded-[20px] border border-gray-100 shadow-sm">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Mesa</div>
              <div className="text-xl font-black text-[#006847] leading-none">{selectedTeam}</div>
            </div>
          </div>
          <div className="flex-1 min-w-[150px] hidden md:block pl-4">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Equipo Activo</div>
            <div className="text-sm font-black text-gray-800 uppercase tracking-tight truncate">{currentMatch?.[`team${selectedTeam}`] || '—'}</div>
          </div>
          <button 
            onClick={() => setIsConfigured(false)}
            className="flex items-center gap-2 text-[9px] font-black bg-white hover:bg-gray-50 text-gray-400 hover:text-[#CE1126] px-5 py-3 rounded-[18px] uppercase tracking-[0.15em] transition-all border border-gray-200 active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3 h-3" /> Cambiar
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="relative overflow-hidden rounded-[48px] shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)] bg-white border-8 border-white">
          <img src="/field.png" alt="FLL Field" className="w-full h-auto block opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
          {mapMarkers.map((marker) => (
            <a
              key={marker.id}
              href={`/misiones/${marker.id}`}
              className="absolute group/marker"
              style={{ top: marker.top, left: marker.left, width: '7%', height: '9%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-full h-full rounded-full border-4 border-transparent group-hover/marker:border-[#006847]/40 group-hover/marker:bg-[#006847]/10 transition-all duration-300" />
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4 pb-12">
        {mapMarkers.map((marker) => (
          <a
            key={marker.id}
            href={`/misiones/${marker.id}`}
            className="flex flex-col items-center justify-center aspect-square bg-white border border-gray-100 rounded-[24px] hover:border-[#006847] hover:shadow-xl hover:shadow-[#006847]/5 transition-all active:scale-90 group shadow-sm"
          >
            <span className="text-2xl font-black text-gray-300 group-hover:text-[#006847] transition-colors italic">{marker.id}</span>
            <span className="text-[8px] font-black text-gray-400 group-hover:text-gray-600 uppercase tracking-widest mt-1">Misión</span>
          </a>
        ))}
      </div>

      {/* Fondo decorativo tech */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#006847]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#CE1126]/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
