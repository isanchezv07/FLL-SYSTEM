'use client';

import { useEffect, useState, useMemo } from 'react';
import { socket } from '@/lib/socket';
import { Trophy, Zap, Hash, Layers, RefreshCw, X, ChevronRight, Settings2, Target, Info, Play, Pause, RotateCcw, ChevronLeft, Users } from 'lucide-react';
import { missionBounds, missionValueFromMissionsFlat, missionValueToPatch } from '@/lib/fllMissionMapping';

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
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 PANEL DE CONTROL MAESTRO (Sticky) */}
      <div className="sticky top-4 z-40 bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-800 rounded-[40px] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col xl:flex-row gap-8 items-center justify-between">
          
          {/* Navegación de Partidos */}
          <div className="flex items-center gap-4 bg-slate-950/50 p-2 rounded-[24px] border border-slate-800/50">
            <button 
              onClick={() => socket.emit('prevMatch')}
              className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="px-6 text-center">
              <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Navigation</div>
              <div className="text-xl font-black text-white tabular-nums tracking-tighter uppercase">Switch Match</div>
            </div>
            <button 
              onClick={() => socket.emit('nextMatch')}
              className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-800"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* ENGINE CONTROLS (TIMER) */}
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 mr-4">
                <button 
                  onClick={() => { setSelectionMode(false); setSelectedIds([]); }}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!selectionMode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  Clásico
                </button>
                <button 
                  onClick={() => setSelectionMode(true)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectionMode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  Simultáneo
                </button>
             </div>

            {!selectionMode ? (
              <>
                <button
                  onClick={() => socket.emit('startTimer')}
                  className="flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 group"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                  Launch Engine
                </button>
              </>
            ) : (
              <button
                onClick={launchSimultaneous}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all active:scale-95 disabled:opacity-20 group"
              >
                Launch {selectedIds.length} Matches
              </button>
            )}
            
            <button
              onClick={() => socket.emit('pauseTimer')}
              className="p-5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-[24px] border-2 border-amber-500/20 transition-all active:scale-90"
              title="Pause Timer"
            >
              <Pause className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={() => socket.emit('resetTimer')}
              className="p-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[24px] border-2 border-red-500/20 transition-all active:scale-90"
              title="Reset Timer"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          {/* Configuración de Bracket y Canchas */}
          <div className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-[24px] border border-slate-800/50">
            <div className="flex flex-col px-2 border-r border-slate-800">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 text-center">Canchas</span>
              <select 
                value={timerState.fieldCount} 
                onChange={(e) => updateFieldCount(Number(e.target.value))} 
                className="bg-transparent text-emerald-400 font-black text-xs outline-none uppercase tracking-widest cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Canchas</option>)}
              </select>
            </div>
            
            <div className="flex flex-col px-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 text-center">Mode</span>
              <select value={bracketMode} onChange={(e) => setBracketMode(e.target.value as any)} className="bg-transparent text-blue-400 font-black text-xs outline-none uppercase tracking-widest cursor-pointer">
                <option value="1vs1">1 vs 1</option>
                <option value="2vs2">2 vs 2</option>
              </select>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <select
              value={bracketSize}
              onChange={(e) => setBracketSize(Number(e.target.value))}
              className="bg-transparent font-medium focus:outline-none px-2"
            >
              {[0, 4, 8, 16, 32].map(n => <option key={n} value={n}>Top {n}</option>)}
            </select>
            <button 
              onClick={createBracket}
              className="flex items-center gap-2 bg-slate-800 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all"
            >
              <Layers className="w-3 h-3" />
              New Bracket
            </button>
          </div>
        </div>
      </div>

      {/* 📊 VISUALIZACIÓN DE BRACKET */}
      <div className="px-4">
        <div className="flex flex-col mb-8">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Tournament Bracket</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Target className="w-3 h-3 text-blue-500" />
            Haz clic en un partido para editar puntajes por misión
          </p>
        </div>

        <div className="flex gap-12 overflow-x-auto pb-12 scrollbar-hide snap-x">
          {rounds.map(round => (
            <div key={round.number} className="flex-shrink-0 w-80 space-y-8 snap-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 font-black text-sm text-blue-500 shadow-xl">{round.number}</div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">ROUND PHASE</span>
              </div>
              <div className="space-y-6">
                {round.matches.map(match => (
                  <div 
                    key={match.id}
                    onClick={() => selectionMode ? toggleSelection(match.id) : setEditingMatchId(match.id)}
                    className={`group relative bg-slate-900/40 border-2 rounded-[32px] p-6 cursor-pointer transition-all duration-500 hover:scale-[1.05] hover:bg-slate-900 shadow-2xl ${
                      selectedIds.includes(match.id) ? 'border-amber-500 bg-amber-500/10 shadow-amber-500/20' :
                      match.status === 'in_progress' ? 'border-blue-500 shadow-blue-500/20 bg-slate-900 animate-pulse-slow' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {selectedIds.includes(match.id) && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-30 animate-bounce">
                        Seleccionado
                      </div>
                    )}
                    <div className="absolute -top-3 left-8 bg-slate-950 px-4 py-1 rounded-full border border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] z-10 group-hover:text-blue-400 transition-colors">MATCH #{match.position}</div>
                    
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
                            className={`w-5 h-5 rounded-full text-[8px] font-black flex items-center justify-center border transition-all ${
                              isAssigned 
                                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                                : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-300 uppercase truncate max-w-[150px]">{match.teamA1 || 'TBD'} {match.teamA2 && `+ ${match.teamA2}`}</span>
                        <span className={`font-mono font-black text-2xl ${match.status === 'finished' && match.scoreA > match.scoreB ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-slate-600'}`}>{match.scoreA}</span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-300 uppercase truncate max-w-[150px]">{match.teamB1 || 'TBD'} {match.teamB2 && `+ ${match.teamB2}`}</span>
                        <span className={`font-mono font-black text-2xl ${match.status === 'finished' && match.scoreB > match.scoreA ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-slate-600'}`}>{match.scoreB}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INSPECTOR DE PARTIDO (MODAL) */}
      {editingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setEditingMatchId(null)} />
          <div className="relative w-full max-w-7xl h-full max-h-[95vh] bg-slate-900 border border-slate-800 rounded-[60px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
            
            {/* Header Inspector */}
            <div className="p-8 lg:p-12 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-8 bg-slate-950/20">
              <div className="flex items-center gap-8 text-white">
                <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-900/40 border-b-8 border-blue-800">
                  <Target className="text-white w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Match Inspector</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-black text-blue-400 uppercase tracking-widest">Match #{editingMatch.position}</span>
                    <span className="px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">Round {editingMatch.round}</span>
                  </div>
                </div>
              </div>

              {/* Score en vivo */}
              <div className="flex items-center gap-12 bg-slate-950/80 px-12 py-6 rounded-[40px] border-2 border-slate-800 shadow-inner">
                <div className="text-center">
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">ALLIANCE A</div>
                  <div className="text-6xl font-mono font-black text-white">{editingMatch.scoreA}</div>
                </div>
                <div className="text-4xl font-black text-slate-800 italic">VS</div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">ALLIANCE B</div>
                  <div className="text-6xl font-mono font-black text-white">{editingMatch.scoreB}</div>
                </div>
              </div>

              <button onClick={() => setEditingMatchId(null)} className="w-16 h-16 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-3xl transition-all flex items-center justify-center border border-slate-700">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 lg:p-12 space-y-12 scrollbar-thin scrollbar-thumb-slate-800 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-6">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Alliance A Control</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailedTeamBox team="A1" name={editingMatch.teamA1} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="blue" />
                    <DetailedTeamBox team="A2" name={editingMatch.teamA2} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="blue" />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-l-4 border-red-600 pl-6">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Alliance B Control</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailedTeamBox team="B1" name={editingMatch.teamB1} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="red" />
                    <DetailedTeamBox team="B2" name={editingMatch.teamB2} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="red" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailedTeamBox({ team, name, matchId, matches, onUpdate, color }: any) {
  if (!name) return <div className="bg-slate-950/30 border-2 border-slate-800 border-dashed rounded-[40px] p-12 flex flex-col items-center justify-center text-center opacity-40"><Users className="w-10 h-10 text-slate-700 mb-4" /><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Assignment</span></div>;
  const match = matches.find((m: any) => m.id === matchId);
  const missions = match?.[`missions${team}`] || {};
  const missionList = Object.keys(missionBounds);
  const accentColor = color === 'blue' ? 'blue' : 'red';

  return (
    <div className="bg-slate-950/50 border border-slate-800 rounded-[48px] p-8 space-y-8 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 bg-${accentColor}-600/30`} />
      <div className="flex justify-between items-start">
        <div>
          <span className={`text-[9px] font-black uppercase tracking-[0.3em] text-${accentColor}-500 mb-1 block`}>Mesa {team}</span>
          <h4 className="text-xl font-black uppercase tracking-tight leading-tight">{name}</h4>
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2.5">
          {missionList.map(mId => {
            const val = missionValueFromMissionsFlat(mId as any, missions);
            const bounds = missionBounds[mId as any];
            const isMax = val === bounds.max && bounds.max > 0;
            return (
              <div key={mId} className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${isMax ? `bg-${accentColor}-600/10 border-${accentColor}-500/30` : 'bg-slate-900/40 border-slate-800/50'}`}>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">M{mId.padStart(2,'0')}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${isMax ? 'text-white' : 'text-slate-400'}`}>{MISSION_NAMES[mId] || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner text-white">
                  <button onClick={() => onUpdate(matchId, `missions${team}`, mId, -1)} disabled={val <= bounds.min} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 disabled:opacity-10 rounded-lg font-black text-lg transition-all active:scale-90">-</button>
                  <span className={`font-mono font-black text-sm w-6 text-center tabular-nums ${isMax ? `text-${accentColor}-400` : 'text-slate-300'}`}>{val}</span>
                  <button onClick={() => onUpdate(matchId, `missions${team}`, mId, 1)} disabled={val >= bounds.max} className={`w-8 h-8 bg-${accentColor}-600 hover:bg-${accentColor}-500 disabled:opacity-10 rounded-lg font-black text-lg transition-all active:scale-90`}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
