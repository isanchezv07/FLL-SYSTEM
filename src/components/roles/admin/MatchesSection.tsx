'use client';

import { useEffect, useState, useMemo } from 'react';
import { socket } from '@/lib/socket';
import { Trophy, Zap, Hash, Layers, RefreshCw, X, ChevronRight, Settings2, Target, Info, Play, Pause, RotateCcw, ChevronLeft, Users, Shield } from 'lucide-react';
import { missionBounds, missionValueFromMissionsFlat, missionValueToPatch } from '@/lib/fllMissionMapping';
import AllianceSelection from './AllianceSelection';

const MISSION_NAMES: Record<string, string> = {
  '1': "Surface Brushing",
  '2': "Map Reveal",
  '3-4': "Mineshaft / Recovery",
  '5': "Who Lived Here?",
  '6': "Forge",
  '7': "Heavy Lifting",
  '8': "Silo",
  '9': "What's on Sale?",
  '10': "Tip the Scales",
  '11': "Angler Artifacts",
  '12': "Salvage Operation",
  '13': "Statue Rebuild",
  '14': "Forum",
  '15': "Precision Tokens"
};

interface Match {
  id: string;
  teamA1: string;
  teamA2: string;
  teamB1: string;
  teamB2: string;
  scoreA: number;
  scoreB: number;
  round: number;
  position: number;
  status: 'pending' | 'in_progress' | 'finished';
  nextMatchId?: string | null;
  missionsA1: any;
  missionsA2: any;
  missionsB1: any;
  missionsB2: any;
  precision?: number;
}

interface TimerState {
  fields: Record<string, string | null>;
  fieldCount: number;
}

export default function MatchesSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [timerState, setTimerState] = useState<TimerState>({ fields: {}, fieldCount: 4 });
  const [loading, setLoading] = useState(true);
  const [bracketSize, setBracketSize] = useState(8);
  const [bracketMode, setBracketMode] = useState<'1vs1' | '2vs2'>('2vs2');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [showAllianceSelection, setShowAllianceSelection] = useState(false);
  
  // Estados para Selección Múltiple
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchMatches();
    const handler = () => fetchMatches();
    socket.on('matchesUpdate', handler);
    socket.on('timerUpdate', (data) => setTimerState(data));
    socket.emit('getTimer');
    return () => { 
      socket.off('matchesUpdate', handler); 
      socket.off('timerUpdate');
    };
  }, []);

  const assignToField = (fieldId: string, matchId: string | null) => {
    socket.emit('assignMatchToField', { fieldId, matchId });
  };

  const updateFieldCount = (count: number) => {
    socket.emit('updateTimer', { fieldCount: count });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      const match = matches.find(m => m.id === id);
      const firstSelected = matches.find(m => m.id === prev[0]);
      // Validar que sea de la misma ronda que el primero seleccionado
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

    // 1. Limpiar canchas actuales
    for (let i = 1; i <= timerState.fieldCount; i++) {
      socket.emit('assignMatchToField', { fieldId: `cancha${i}`, matchId: null });
    }

    // 2. Asignar nuevos y poner en progreso
    for (let i = 0; i < selectedIds.length; i++) {
      const mId = selectedIds[i];
      socket.emit('assignMatchToField', { fieldId: `cancha${i+1}`, matchId: mId });
      
      await fetch(`/api/matches/${mId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      });
    }

    setSelectionMode(false);
    setSelectedIds([]);
    socket.emit('resetTimer');
    alert(`Lanzados ${selectedIds.length} partidos simultáneos`);
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
    } catch (e) { } finally { setLoading(false); }
  };

  const activeMatchId = editingMatchId;
  const editingMatch = useMemo(() => matches.find(m => m.id === activeMatchId) || null, [matches, activeMatchId]);

  const createBracket = async () => {
    if (!confirm('¿Generar nuevo bracket? Se borrarán todos los datos actuales.')) return;
    try {
      await fetch('/api/brackets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: bracketSize, mode: bracketMode })
      });
      fetchMatches();
    } catch { }
  };

  const updateMatchMissions = async (matchId: string, teamKey: string, missionId: string, delta: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    const missions = match[teamKey as keyof Match] || {};
    const currentValue = missionValueFromMissionsFlat(missionId as any, missions);
    const bounds = missionBounds[missionId as any];
    const newValue = Math.max(bounds.min, Math.min(bounds.max, currentValue + delta));
    const patch = missionValueToPatch(missionId as any, newValue);
    
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) return { ...m, [teamKey]: { ...m[teamKey as keyof Match], ...patch } };
      return m;
    }));

    try {
      await fetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [teamKey]: patch })
      });
    } catch (e) { fetchMatches(); }
  };

  const changeStatus = async (id: string, status: string) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status: status as any } : m));
    try {
      await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) { fetchMatches(); }
  };

  const rounds = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    matches.forEach(m => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return Object.keys(grouped).map(Number).sort((a, b) => a - b).map(r => ({
      number: r,
      matches: grouped[r].sort((a, b) => a.position - b.position)
    }));
  }, [matches]);

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-blue-500 font-black tracking-widest uppercase">Initializing Command Center...</div>;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700 font-sans">
      
      {/* 🚀 PANEL DE CONTROL MAESTRO (Sticky) */}
      <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-4 lg:p-6 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex flex-wrap gap-6 items-center justify-center lg:justify-between">
          
          {/* Navegación de Partidos */}
          <div className="flex items-center gap-2 sm:gap-4 bg-gray-50 p-2 rounded-[24px] border border-gray-100 shadow-inner">
            <button 
              onClick={() => socket.emit('prevMatch')}
              className="p-3 sm:p-4 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all active:scale-90 border border-gray-200 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 h-6" />
            </button>
            <div className="px-2 sm:px-6 text-center">
              <div className="text-[8px] sm:text-[9px] font-black text-[#006847] uppercase tracking-[0.3em] mb-1 italic">Navegación</div>
              <div className="text-sm sm:text-xl font-black text-gray-900 tabular-nums tracking-tighter uppercase italic">Cambiar Partido</div>
            </div>
            <button 
              onClick={() => socket.emit('nextMatch')}
              className="p-3 sm:p-4 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all active:scale-90 border border-gray-200 shadow-sm"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 h-6" />
            </button>
          </div>

          {/* ENGINE CONTROLS (TIMER) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
             <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                <button 
                  onClick={() => { setSelectionMode(false); setSelectedIds([]); }}
                  className={`px-3 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${!selectionMode ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  Clásico
                </button>
                <button 
                  onClick={() => setSelectionMode(true)}
                  className={`px-3 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${selectionMode ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  Simultáneo
                </button>
             </div>

            {!selectionMode ? (
              <button
                onClick={() => socket.emit('startTimer')}
                className="flex items-center gap-2 sm:gap-4 bg-[#006847] hover:bg-[#005a3e] text-white px-6 sm:px-10 py-4 sm:py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] sm:text-sm shadow-xl shadow-[#006847]/20 transition-all active:scale-95 group transform hover:-translate-y-1"
              >
                <div className="w-2 h-2 sm:w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                Iniciar Motor
              </button>
            ) : (
              <button
                onClick={launchSimultaneous}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-2 sm:gap-4 bg-gray-900 hover:bg-black text-white px-6 sm:px-10 py-4 sm:py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] sm:text-sm shadow-xl shadow-gray-900/20 transition-all active:scale-95 disabled:opacity-20 group transform hover:-translate-y-1"
              >
                Lanzar {selectedIds.length} Partidos
              </button>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => socket.emit('pauseTimer')}
                className="p-4 sm:p-5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-[24px] border border-amber-200 transition-all active:scale-90 shadow-sm"
                title="Pause Timer"
              >
                <Pause className="w-5 h-5 sm:w-6 h-6 fill-current" />
              </button>

              <button
                onClick={() => socket.emit('resetTimer')}
                className="p-4 sm:p-5 bg-red-50 hover:bg-red-100 text-[#CE1126] rounded-[24px] border border-red-200 transition-all active:scale-90 shadow-sm"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Configuración de Bracket y Canchas */}
          <div className="flex flex-wrap items-center justify-center gap-4 bg-gray-50 p-3 rounded-[24px] border border-gray-100 shadow-inner">
            <button 
              onClick={() => setShowAllianceSelection(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[8px] sm:text-[9px] transition-all shadow-md active:scale-95"
            >
              <Shield className="w-3 h-3" />
              Alianzas
            </button>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col px-2 border-r border-gray-200">
                <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Canchas</span>
                <select 
                  value={timerState.fieldCount} 
                  onChange={(e) => updateFieldCount(Number(e.target.value))} 
                  className="bg-transparent text-[#006847] font-black text-[10px] sm:text-xs outline-none uppercase tracking-widest cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Canchas</option>)}
                </select>
              </div>
              
              <div className="flex flex-col px-2 border-r border-gray-200">
                <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Modo</span>
                <select value={bracketMode} onChange={(e) => setBracketMode(e.target.value as any)} className="bg-transparent text-gray-900 font-black text-[10px] sm:text-xs outline-none uppercase tracking-widest cursor-pointer">
                  <option value="1vs1">1 vs 1</option>
                  <option value="2vs2">2 vs 2</option>
                </select>
              </div>

              <div className="flex flex-col px-2">
                <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Top</span>
                <select
                  value={bracketSize}
                  onChange={(e) => setBracketSize(Number(e.target.value))}
                  className="bg-transparent font-black text-[10px] sm:text-xs uppercase tracking-widest focus:outline-none px-1 text-gray-900 cursor-pointer"
                >
                  {[0, 4, 8, 16, 32].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 📊 VISUALIZACIÓN DE BRACKET */}
      <div className="px-4">
        <div className="flex flex-col mb-12">
          <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter italic">
            Bracket del <span className="text-[#006847]">Tor</span>neo
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            <Target className="w-3 h-3 text-[#006847]" />
            Haz clic en un partido para editar puntajes por misión
          </p>
        </div>

        <div className="flex gap-12 overflow-x-auto pb-12 scrollbar-hide snap-x">
          {rounds.length > 0 ? rounds.map(round => (
            <div key={round.number} className="flex-shrink-0 w-80 space-y-8 snap-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 font-black text-lg text-[#006847] shadow-lg shadow-gray-200/50 italic">{round.number}</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none mb-1">Fase de Ronda</span>
                  <span className="text-[8px] font-bold text-[#CE1126] uppercase tracking-[0.2em] leading-none">Ronda #{round.number}</span>
                </div>
              </div>
              <div className="space-y-6">
                {round.matches.map(match => (
                  <div 
                    key={match.id}
                    onClick={() => selectionMode ? toggleSelection(match.id) : setEditingMatchId(match.id)}
                    className={`group relative bg-white border rounded-[32px] p-6 cursor-pointer transition-all duration-500 hover:scale-[1.05] shadow-xl shadow-gray-200/40 ${
                      selectedIds.includes(match.id) ? 'border-amber-500 bg-amber-50 shadow-amber-200/50' :
                      match.status === 'in_progress' ? 'border-[#006847] shadow-[#006847]/10 bg-white' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {selectedIds.includes(match.id) && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest z-30 animate-bounce shadow-lg">
                        Seleccionado
                      </div>
                    )}
                    <div className="absolute -top-3 left-8 bg-white px-4 py-1.5 rounded-full border border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] z-10 group-hover:text-[#006847] transition-colors shadow-sm italic">PARTIDO #{match.position}</div>
                    
                    {/* Field Assignment Selector */}
                    <div className="absolute -top-3 right-4 z-20 flex gap-1">
                      {Array.from({ length: timerState.fieldCount }).map((_, idx) => {
                        const f = `cancha${idx + 1}`;
                        const isAssigned = timerState.fields?.[f] === match.id;
                        return (
                          <button
                            key={f}
                            title={f}
                            onClick={(e) => {
                              e.stopPropagation();
                              assignToField(f, isAssigned ? null : match.id);
                            }}
                            className={`w-6 h-6 rounded-full text-[9px] font-black flex items-center justify-center border transition-all ${
                              isAssigned 
                                ? 'bg-[#006847] border-[#006847] text-white shadow-lg shadow-[#006847]/30' 
                                : 'bg-white border-gray-200 text-gray-400 hover:border-gray-400 shadow-sm'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-4 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-gray-800 uppercase truncate max-w-[150px] italic">{match.teamA1 || 'TBD'} {match.teamA2 && `+ ${match.teamA2}`}</span>
                        <span className={`font-mono font-black text-2xl tabular-nums ${match.status === 'finished' && match.scoreA > match.scoreB ? 'text-[#006847] drop-shadow-[0_0_8px_rgba(0,104,71,0.2)]' : 'text-gray-300'}`}>{match.scoreA}</span>
                      </div>
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-gray-800 uppercase truncate max-w-[150px] italic">{match.teamB1 || 'TBD'} {match.teamB2 && `+ ${match.teamB2}`}</span>
                        <span className={`font-mono font-black text-2xl tabular-nums ${match.status === 'finished' && match.scoreB > match.scoreA ? 'text-[#006847] drop-shadow-[0_0_8px_rgba(0,104,71,0.2)]' : 'text-gray-300'}`}>{match.scoreB}</span>
                      </div>
                    </div>

                    {match.status === 'in_progress' && (
                      <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-[80%] h-[4px] flex rounded-full overflow-hidden">
                        <div className="flex-1 bg-[#006847] animate-pulse"></div>
                        <div className="flex-1 bg-white"></div>
                        <div className="flex-1 bg-[#CE1126] animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[48px] border-4 border-dashed border-gray-100">
               <Shield className="w-16 h-16 text-gray-200 mb-6" />
               <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No hay partidos programados</p>
               <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest mt-2">Usa el botón de Alianzas para iniciar el draft</p>
            </div>
          )}
        </div>
      </div>

      {/* INSPECTOR DE PARTIDO (MODAL) */}
      {editingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-2xl" onClick={() => setEditingMatchId(null)} />
          <div className="relative w-full max-w-7xl h-full max-h-[95vh] bg-[#f8fafc] border border-white rounded-[60px] shadow-[0_48px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
            
            {/* Header Inspector */}
            <div className="p-8 lg:p-12 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-8 bg-white/50 backdrop-blur-xl">
              <div className="flex items-center gap-8 text-gray-900">
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-xl border border-gray-50 transform hover:rotate-6 transition-transform">
                  <img src="/img/logo_internacional.svg" alt="FLL Logo" className="h-10 w-auto" />
                </div>
                <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Inspector de <span className="text-[#006847]">Parti</span>do</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="px-4 py-2 bg-gray-900 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">Partido #{editingMatch.position}</span>
                    <span className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">Ronda {editingMatch.round}</span>
                  </div>
                </div>
              </div>

              {/* Score en vivo */}
              <div className="flex items-center gap-12 bg-white px-12 py-7 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="text-center">
                  <div className="text-[10px] font-black text-[#006847] uppercase tracking-[0.3em] mb-1 italic">ALIANZA A</div>
                  <div className="text-7xl font-mono font-black text-gray-900 tabular-nums leading-none">{editingMatch.scoreA}</div>
                </div>
                <div className="text-5xl font-black text-gray-200 italic mx-4">VS</div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-[#CE1126] uppercase tracking-[0.3em] mb-1 italic">ALIANZA B</div>
                  <div className="text-7xl font-mono font-black text-gray-900 tabular-nums leading-none">{editingMatch.scoreB}</div>
                </div>
              </div>

              <button onClick={() => setEditingMatchId(null)} className="w-16 h-16 bg-white hover:bg-red-50 hover:text-[#CE1126] text-gray-300 rounded-3xl transition-all flex items-center justify-center border border-gray-100 shadow-sm">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 lg:p-12 space-y-12 scrollbar-thin scrollbar-thumb-gray-200 text-gray-900 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-l-8 border-[#006847] pl-6 py-2">
                    <h3 className="text-3xl font-black uppercase tracking-tight italic">Control Alianza <span className="text-[#006847]">A</span></h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DetailedTeamBox team="A1" name={editingMatch.teamA1} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="green" />
                    <DetailedTeamBox team="A2" name={editingMatch.teamA2} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="green" />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-l-8 border-[#CE1126] pl-6 py-2">
                    <h3 className="text-3xl font-black uppercase tracking-tight italic">Control Alianza <span className="text-[#CE1126]">B</span></h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DetailedTeamBox team="B1" name={editingMatch.teamB1} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="red" />
                    <DetailedTeamBox team="B2" name={editingMatch.teamB2} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="red" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAllianceSelection && (
        <AllianceSelection onClose={() => setShowAllianceSelection(false)} />
      )}
    </div>
  );
}

function DetailedTeamBox({ team, name, matchId, matches, onUpdate, color }: any) {
  if (!name) return (
    <div className="bg-white/50 border-4 border-gray-100 border-dashed rounded-[48px] p-12 flex flex-col items-center justify-center text-center opacity-40">
      <Users className="w-12 h-12 text-gray-200 mb-4" />
      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sin Asignación</span>
    </div>
  );
  
  const match = matches.find((m: any) => m.id === matchId);
  const missions = match?.[`missions${team}`] || {};
  const missionList = Object.keys(missionBounds);
  const accentColor = color === 'green' ? '#006847' : '#CE1126';
  const shadowColor = color === 'green' ? 'rgba(0,104,71,0.2)' : 'rgba(206,17,38,0.2)';

  return (
    <div className="bg-white border border-white rounded-[48px] p-8 space-y-8 relative overflow-hidden group shadow-xl shadow-gray-200/50 transition-all hover:shadow-2xl hover:scale-[1.02]">
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 block italic" style={{ color: accentColor }}>Mesa {team}</span>
          <h4 className="text-2xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">{name}</h4>
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          {missionList.map(mId => {
            const val = missionValueFromMissionsFlat(mId as any, missions);
            const bounds = missionBounds[mId as any];
            const isMax = val === bounds.max && bounds.max > 0;
            return (
              <div key={mId} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isMax ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-50 shadow-sm'}`}>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">M{mId.padStart(2,'0')}</span>
                  <span className={`text-[11px] font-black uppercase tracking-tight leading-none ${isMax ? 'text-gray-900' : 'text-gray-500'}`}>{MISSION_NAMES[mId] || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-inner">
                  <button 
                    onClick={() => onUpdate(matchId, `missions${team}`, mId, -1)} 
                    disabled={val <= bounds.min} 
                    className="w-9 h-9 bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-20 rounded-lg font-black text-xl transition-all active:scale-90 text-gray-400 shadow-sm"
                  >-</button>
                  <span className={`font-mono font-black text-lg w-7 text-center tabular-nums ${isMax ? 'text-gray-900' : 'text-gray-400'}`} style={isMax ? { color: accentColor, textShadow: `0 0 10px ${shadowColor}` } : {}}>{val}</span>
                  <button 
                    onClick={() => onUpdate(matchId, `missions${team}`, mId, 1)} 
                    disabled={val >= bounds.max} 
                    className="w-9 h-9 text-white disabled:opacity-20 rounded-lg font-black text-xl transition-all active:scale-90 shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
