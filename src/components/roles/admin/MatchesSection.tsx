'use client';

import { useEffect, useState, useMemo } from 'react';
import { socket } from '@/lib/socket';
import { Trophy, Zap, Hash, Layers, RefreshCw, X, ChevronRight, Settings2, Target, Info, Play, Pause, RotateCcw, ChevronLeft, Users, Shield, Image, Volume2, Search, ShieldCheck } from 'lucide-react';
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
  displayMode?: 'live' | 'bracket' | 'sponsors' | 'sound';
  layoutPosition?: 'top' | 'bottom';
}

export default function MatchesSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [alliances, setAlliances] = useState<any[]>([]);
  const [timerState, setTimerState] = useState<TimerState>({ fields: {}, fieldCount: 4, layoutPosition: 'top' });
  const [loading, setLoading] = useState(true);
  const [bracketSize, setBracketSize] = useState(8);
  const [bracketMode, setBracketMode] = useState<'1vs1' | '2vs2'>('2vs2');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editingAlliancesMatchId, setEditingAlliancesMatchId] = useState<string | null>(null);
  const [showAllianceSelection, setShowAllianceSelection] = useState(false);
  const [showManualBracketBuilder, setShowManualBracketBuilder] = useState(false);
  const [manualSlots, setManualSlots] = useState<(number | null)[]>([]);
  
  // Estados para Selección Múltiple
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allianceSearchTerm, setAllianceSearchTerm] = useState('');

  const requiredAlliancesCount = useMemo(() => {
    return bracketMode === '1vs1' ? bracketSize : bracketSize / 2;
  }, [bracketSize, bracketMode]);

  useEffect(() => {
    if (showManualBracketBuilder) {
      setManualSlots(new Array(requiredAlliancesCount).fill(null));
    }
  }, [showManualBracketBuilder, requiredAlliancesCount]);

  const handleManualGenerate = async () => {
    if (manualSlots.some(s => s === null)) {
      alert('Por favor, llena todos los espacios del bracket.');
      return;
    }

    try {
      const orderedAlliances = manualSlots.map(id => alliances.find(a => a.id === id).teams);
      await fetch('/api/brackets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: bracketSize, mode: bracketMode, alliances: orderedAlliances })
      });
      fetchMatches();
      setShowManualBracketBuilder(false);
      alert('Bracket generado con éxito');
    } catch {
      alert('Error al generar el bracket');
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchAlliances();
    const handler = () => fetchMatches();
    const onAlliancesUpdate = (data: any) => {
      if (data && data.alliances) setAlliances(data.alliances);
    };
    const onTimerUpdate = (data: any) => setTimerState(data);

    socket.on('matchesUpdate', handler);
    socket.on('alliancesUpdate', onAlliancesUpdate);
    socket.on('timerUpdate', onTimerUpdate);
    
    socket.emit('getTimer');
    socket.emit('getAlliances');

    return () => { 
      socket.off('matchesUpdate', handler); 
      socket.off('alliancesUpdate', onAlliancesUpdate);
      socket.off('timerUpdate', onTimerUpdate);
    };
  }, []);

  const fetchAlliances = async () => {
    try {
      const res = await fetch('/api/alliances');
      const data = await res.json();
      if (data && data.alliances) setAlliances(data.alliances);
    } catch (e) { }
  };

  const assignToField = (fieldId: string, matchId: string | null) => {
    socket.emit('assignMatchToField', { fieldId, matchId });
  };

  const loadMatchForPlay = async (matchId: string) => {
    // 1. Encontrar primera cancha libre
    let freeField = null;
    for (let i = 1; i <= timerState.fieldCount; i++) {
      if (!timerState.fields[`cancha${i}`]) {
        freeField = `cancha${i}`;
        break;
      }
    }

    if (!freeField) {
      alert("No hay canchas libres. Libera una para cargar este partido.");
      return;
    }

    // 2. Asignar y poner en progreso
    socket.emit('assignMatchToField', { fieldId: freeField, matchId });
    await changeStatus(matchId, 'in_progress');
    socket.emit('resetTimer');
    alert(`Partido cargado en ${freeField}`);
  };

  const assignAllianceToMatch = async (matchId: string, allianceId: number, slot: 'A' | 'B') => {
    const alliance = alliances.find(a => a.id === allianceId);
    if (!alliance) return;

    const update: any = {};
    if (slot === 'A') {
      update.teamA1 = alliance.teams[0] || "";
      update.teamA2 = alliance.teams[1] || "";
      update.missionsA1 = {};
      update.missionsA2 = {};
    } else {
      update.teamB1 = alliance.teams[0] || "";
      update.teamB2 = alliance.teams[1] || "";
      update.missionsB1 = {};
      update.missionsB2 = {};
    }

    try {
      await fetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      fetchMatches();
    } catch (e) { }
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

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-blue-600 font-black tracking-widest uppercase">Initializing Command Center...</div>;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 font-sans text-slate-800 dark:text-slate-200">
      
      {/* 🛠️ MATCH CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => socket.emit('prevMatch')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded font-bold tabular-nums min-w-[120px] text-center text-slate-700 dark:text-slate-300">
                    Match Selector
                </div>
                <button 
                  onClick={() => socket.emit('nextMatch')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
                <button 
                  onClick={() => { setSelectionMode(false); setSelectedIds([]); }}
                  className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${!selectionMode ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setSelectionMode(true)}
                  className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${selectionMode ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Simultaneous
                </button>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {!selectionMode ? (
              <button
                onClick={() => socket.emit('startTimer')}
                className="flex items-center gap-3 bg-[#28a745] hover:bg-[#218838] text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-sm shadow-md transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Match
              </button>
            ) : (
              <button
                onClick={launchSimultaneous}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-3 bg-[#0066B3] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                Launch {selectedIds.length} Matches
              </button>
            )}
            
            <button
                onClick={() => socket.emit('pauseTimer')}
                className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all active:scale-95 shadow-md"
                title="Pause Match"
            >
                <Pause className="w-5 h-5 fill-current" />
            </button>

            <button
                onClick={() => socket.emit('resetTimer')}
                className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all active:scale-95 shadow-md"
                title="Abort/Reset"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* 📋 SETUP & ALLIANCES */}
      <div className="flex flex-wrap gap-4 items-center">
          <button 
            onClick={() => setShowAllianceSelection(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Manage Alliances
          </button>

          <button 
            onClick={() => setShowManualBracketBuilder(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            Build Bracket
          </button>

          <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-800 mx-2" />

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg shadow-sm transition-colors">
              <div className="flex items-center gap-2">
                <span>Display:</span>
                <button 
                  onClick={() => {
                    const nextMode = timerState.displayMode === 'bracket' ? 'live' : 'bracket';
                    socket.emit('updateTimer', { displayMode: nextMode });
                    setTimerState(prev => ({ ...prev, displayMode: nextMode }));
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded transition-all font-bold ${timerState.displayMode === 'bracket' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-blue-600/20'}`}
                >
                  <Layers className="w-3 h-3" />
                  {timerState.displayMode === 'bracket' ? 'Showing Bracket' : 'Show Bracket'}
                </button>
                <button 
                  onClick={() => {
                    const nextMode = timerState.displayMode === 'sponsors' ? 'live' : 'sponsors';
                    socket.emit('updateTimer', { displayMode: nextMode });
                    setTimerState(prev => ({ ...prev, displayMode: nextMode }));
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded transition-all font-bold ${timerState.displayMode === 'sponsors' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-purple-600/20'}`}
                >
                  <Image className="w-3 h-3" />
                  {timerState.displayMode === 'sponsors' ? 'Showing Sponsors' : 'Show Sponsors'}
                </button>
                <button 
                  onClick={() => {
                    const nextMode = timerState.displayMode === 'sound' ? 'live' : 'sound';
                    socket.emit('updateTimer', { displayMode: nextMode });
                    setTimerState(prev => ({ ...prev, displayMode: nextMode }));
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded transition-all font-bold ${timerState.displayMode === 'sound' ? 'bg-amber-600 text-white shadow-lg' : 'text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-amber-600/20'}`}
                >
                  <Volume2 className="w-3 h-3" />
                  {timerState.displayMode === 'sound' ? 'Showing Sound' : 'Show Sound'}
                </button>
              </div>
              <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-2">
                <span>Fields:</span>
                <select value={timerState.fieldCount} onChange={(e) => updateFieldCount(Number(e.target.value))} className="bg-transparent text-blue-600 dark:text-blue-400 outline-none">
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="bg-white dark:bg-slate-900">{n}</option>)}
                </select>
              </div>
              <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-2">
                <span>Mode:</span>
                <select value={bracketMode} onChange={(e) => setBracketMode(e.target.value as any)} className="bg-transparent text-blue-600 dark:text-blue-400 outline-none">
                  <option value="1vs1" className="bg-white dark:bg-slate-900">1 vs 1</option>
                  <option value="2vs2" className="bg-white dark:bg-slate-900">2 vs 2</option>
                </select>
              </div>
          </div>
      </div>


      {/* 📊 MATCH GRID / LIST */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white border-l-4 border-blue-600 dark:border-blue-500 pl-4 uppercase tracking-tight transition-colors">Event Schedule</h2>

        <div className="grid grid-cols-1 gap-4">
          {rounds.map(round => (
            <div key={round.number} className="space-y-4">
              <div className="bg-slate-200 dark:bg-slate-800 px-4 py-1 rounded font-bold text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest transition-colors">
                Round {round.number}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {round.matches.map(match => (
                  <div 
                    key={match.id}
                    onClick={() => selectionMode ? toggleSelection(match.id) : setEditingMatchId(match.id)}
                    className={`bg-white dark:bg-slate-900 border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md relative ${
                      selectedIds.includes(match.id) ? 'ring-2 ring-amber-500' :
                      match.status === 'in_progress' ? 'ring-2 ring-green-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Match Header */}
                    <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-3 py-2 flex justify-between items-center transition-colors">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">M {match.position}</span>
                        <div className="flex gap-1">
                            {match.status === 'pending' && (
                                <button onClick={(e) => { e.stopPropagation(); loadMatchForPlay(match.id); }} className="text-green-600 dark:text-green-500 hover:scale-110"><Play className="w-3 h-3 fill-current"/></button>
                            )}
                            {match.round === 1 && (
                                <button onClick={(e) => { e.stopPropagation(); setEditingAlliancesMatchId(match.id); }} className="text-blue-600 dark:text-blue-400 hover:scale-110"><Shield className="w-3 h-3"/></button>
                            )}
                        </div>
                    </div>

                    {/* Alliances */}
                    <div className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-[#c0392b] rounded-full" />
                                <span className="text-xs font-bold truncate max-w-[120px] text-slate-800 dark:text-slate-200">{match.teamA1 || 'TBD'} {match.teamA2 && `+ ${match.teamA2}`}</span>
                            </div>
                            <span className={`font-mono font-bold text-lg ${match.status === 'finished' && match.scoreA > match.scoreB ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-600'}`}>{match.scoreA}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-[#1565c0] rounded-full" />
                                <span className="text-xs font-bold truncate max-w-[120px] text-slate-800 dark:text-slate-200">{match.teamB1 || 'TBD'} {match.teamB2 && `+ ${match.teamB2}`}</span>
                            </div>
                            <span className={`font-mono font-bold text-lg ${match.status === 'finished' && match.scoreB > match.scoreA ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400 dark:text-slate-600'}`}>{match.scoreB}</span>
                        </div>
                    </div>

                    {/* Field Status */}
                    <div className="px-3 pb-2 flex gap-1 justify-end">
                         {Array.from({ length: timerState.fieldCount }).map((_, idx) => {
                          const f = `cancha${idx + 1}`;
                          const isAssigned = timerState.fields?.[f] === match.id;
                          return (
                            <button
                              key={f}
                              onClick={(e) => { e.stopPropagation(); assignToField(f, isAssigned ? null : match.id); }}
                              className={`w-5 h-5 rounded text-[8px] font-bold border transition-all ${
                                isAssigned ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INSPECTOR DE PARTIDO (MODAL) - FTC Scoring Sheet Style */}
      {editingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-6xl flex flex-col h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
            {/* Modal Header */}
            <div className="bg-[#0066B3] dark:bg-blue-800 text-white px-6 py-4 flex justify-between items-center transition-colors">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Match Scoring Sheet</h2>
                    <span className="bg-white/20 px-3 py-1 rounded text-xs font-bold">Match #{editingMatch.position}</span>
                    <span className="bg-white/20 px-3 py-1 rounded text-xs font-bold">Round {editingMatch.round}</span>
                </div>
                <button onClick={() => setEditingMatchId(null)} className="hover:bg-white/10 p-1 rounded transition-colors"><X className="w-6 h-6" /></button>
            </div>

            {/* Score Summary Banner */}
            <div className="bg-slate-800 dark:bg-black text-white px-10 py-8 flex justify-center items-center gap-20 shadow-inner transition-colors">
                <div className="text-center">
                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-2">Red Alliance</div>
                    <div className="text-7xl font-mono font-bold leading-none">{editingMatch.scoreA}</div>
                </div>
                <div className="text-4xl font-black text-slate-600 dark:text-slate-800 italic">VS</div>
                <div className="text-center">
                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Blue Alliance</div>
                    <div className="text-7xl font-mono font-bold leading-none">{editingMatch.scoreB}</div>
                </div>
            </div>

            {/* Scoring Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RED SIDE */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b-2 border-red-600 pb-2">
                        <div className="w-4 h-4 bg-red-600 rounded" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Red Alliance Details</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <DetailedTeamBox team="A1" name={editingMatch.teamA1} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="red" />
                        <DetailedTeamBox team="A2" name={editingMatch.teamA2} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="red" />
                    </div>
                </div>
                
                {/* BLUE SIDE */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-2">
                        <div className="w-4 h-4 bg-blue-600 rounded" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Blue Alliance Details</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <DetailedTeamBox team="B1" name={editingMatch.teamB1} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="blue" />
                        <DetailedTeamBox team="B2" name={editingMatch.teamB2} matchId={editingMatch.id} matches={matches} onUpdate={updateMatchMissions} color="blue" />
                    </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex justify-end gap-3 transition-colors">
                <button 
                  onClick={() => setEditingMatchId(null)}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-700 rounded font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase text-xs"
                >
                  Close
                </button>
                <button 
                  onClick={() => { changeStatus(editingMatch.id, 'finished'); setEditingMatchId(null); }}
                  className="px-6 py-2 bg-[#28a745] hover:bg-[#218838] text-white rounded font-bold transition-all uppercase text-xs shadow-md"
                >
                  Commit Scores
                </button>
            </div>
          </div>
        </div>
      )}

      {showAllianceSelection && (
        <AllianceSelection onClose={() => setShowAllianceSelection(false)} />
      )}

      {editingAlliancesMatchId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-2xl" onClick={() => setEditingAlliancesMatchId(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col p-10 transition-colors max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white leading-none">Assign <span className="text-blue-600 dark:text-blue-400">Alliances</span></h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Select combat units for Match #{matches.find(m => m.id === editingAlliancesMatchId)?.position}</p>
              </div>
              <button onClick={() => setEditingAlliancesMatchId(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-2xl transition-all"><X /></button>
            </div>

            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search alliances by unit number or team name..." 
                value={allianceSearchTerm}
                onChange={(e) => setAllianceSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-10">
              {['A', 'B'].map((slot) => (
                <div key={slot} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${slot === 'A' ? 'bg-red-600' : 'bg-blue-600'}`}>
                      {slot}
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Alliance {slot} Selection</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {alliances
                      .filter(a => 
                        a.id.toString().includes(allianceSearchTerm) || 
                        a.teamNames.some((name: string) => name.toLowerCase().includes(allianceSearchTerm.toLowerCase()))
                      )
                      .map(a => {
                        const match = matches.find(m => m.id === editingAlliancesMatchId);
                        const isSelected = slot === 'A' 
                          ? match?.teamA1 === a.teams[0] 
                          : match?.teamB1 === a.teams[0];
                        
                        return (
                          <button
                            key={a.id}
                            onClick={() => assignAllianceToMatch(editingAlliancesMatchId, a.id, slot as 'A'|'B')}
                            className={`p-4 rounded-2xl border-2 transition-all text-left relative group ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-slate-100 dark:border-slate-800 hover:border-blue-500/50 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">Unit #{a.id}</div>
                              {isSelected && <Shield className="w-3 h-3 text-blue-600 fill-current" />}
                            </div>
                            <div className="text-[11px] font-black uppercase truncate leading-tight">{a.teamNames.join(' + ')}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">Teams: {a.teams.join(', ')}</div>
                          </button>
                        );
                      })}
                  </div>
                  {alliances.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase italic">
                      No matching alliances found
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setEditingAlliancesMatchId(null)}
                className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
              >
                Save & Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualBracketBuilder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-3xl" onClick={() => setShowManualBracketBuilder(false)} />
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800 rounded-[60px] shadow-[0_48px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col transition-colors">
            
            {/* Header */}
            <div className="p-8 lg:p-10 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-900 dark:bg-blue-600 rounded-[28px] flex items-center justify-center shadow-xl">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter leading-none italic text-slate-900 dark:text-white">
                    Constructor <span className="text-blue-600 dark:text-blue-400">Manual</span>
                  </h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Design match pairings for Round 1</p>
                </div>
              </div>
              <button onClick={() => setShowManualBracketBuilder(false)} className="w-14 h-14 bg-gray-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all border border-gray-100 dark:border-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* Alliances List (Left) */}
              <div className="w-80 border-r border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Alianzas Disponibles</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {alliances.map(alliance => {
                    const isUsed = manualSlots.includes(alliance.id);
                    return (
                      <div 
                        key={alliance.id}
                        className={`p-4 rounded-2xl border transition-all ${isUsed ? 'opacity-30 pointer-events-none bg-gray-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm hover:border-blue-500 text-slate-900 dark:text-white'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Alianza #{alliance.id}</span>
                            <span className="text-[10px] font-black uppercase text-gray-900 dark:text-white line-clamp-2">{alliance.teamNames.join(' + ')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bracket Grid (Right) */}
              <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {Array.from({ length: requiredAlliancesCount / 2 }).map((_, matchIdx) => (
                    <div key={matchIdx} className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black italic text-slate-500">M{matchIdx + 1}</div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Partido #{matchIdx + 1}</h4>
                      </div>
                      
                      <div className="space-y-3 relative">
                        {[0, 1].map(slotIdx => {
                          const globalIdx = matchIdx * 2 + slotIdx;
                          const allianceId = manualSlots[globalIdx];
                          const alliance = alliances.find(a => a.id === allianceId);
                          
                          return (
                            <div key={slotIdx} className="relative group">
                              <select 
                                value={allianceId || ''}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : null;
                                  const newSlots = [...manualSlots];
                                  newSlots[globalIdx] = val;
                                  setManualSlots(newSlots);
                                }}
                                className={`w-full p-5 rounded-2xl border-2 appearance-none outline-none font-black uppercase tracking-tight text-[11px] transition-all ${alliance ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white shadow-lg' : 'border-dashed border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-300 dark:text-slate-700'}`}
                              >
                                <option value="" className="bg-white dark:bg-slate-900">Seleccionar Alianza...</option>
                                {alliances.map(a => (
                                  <option key={a.id} value={a.id} disabled={manualSlots.includes(a.id) && manualSlots[globalIdx] !== a.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    Alianza #{a.id} - {a.teamNames.join(' + ')}
                                  </option>
                                ))}
                              </select>
                              {alliance && (
                                <button 
                                  onClick={() => {
                                    const newSlots = [...manualSlots];
                                    newSlots[globalIdx] = null;
                                    setManualSlots(newSlots);
                                  }}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full flex items-center justify-center text-[8px] font-black text-gray-300 dark:text-slate-600 italic z-10 shadow-sm transition-colors">VS</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center transition-colors">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {manualSlots.filter(s => s !== null).length} / {requiredAlliancesCount} Slots Asignados
              </div>
              <button 
                onClick={handleManualGenerate}
                disabled={manualSlots.some(s => s === null)}
                className="flex items-center gap-4 bg-[#006847] hover:bg-[#005a3e] disabled:opacity-20 text-white px-12 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-[#006847]/20 transition-all active:scale-95"
              >
                <Layers className="w-5 h-5" />
                Finalizar y Crear Bracket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailedTeamBox({ team, name, matchId, matches, onUpdate, color }: any) {
  if (!name) return (
    <div className="bg-white/50 dark:bg-slate-900/50 border-4 border-gray-100 dark:border-slate-800 border-dashed rounded-[48px] p-12 flex flex-col items-center justify-center text-center opacity-40 transition-colors">
      <Users className="w-12 h-12 text-gray-200 dark:text-slate-700 mb-4" />
      <span className="text-[10px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-widest">Sin Asignación</span>
    </div>
  );
  
  const match = matches.find((m: any) => m.id === matchId);
  const missions = match?.[`missions${team}`] || {};
  const missionList = Object.keys(missionBounds);
  const accentColor = color === 'blue' ? '#0066B3' : '#ED1C24';
  const shadowColor = color === 'blue' ? 'rgba(0,102,179,0.2)' : 'rgba(237,28,36,0.2)';

  const isInspectionOk = missions.inspection === 'yes' || missions.inspection === true;

  return (
    <div className="bg-white dark:bg-slate-900 border border-white dark:border-slate-800 rounded-[48px] p-8 space-y-8 relative overflow-hidden group shadow-xl shadow-gray-200/50 dark:shadow-none transition-all hover:shadow-2xl hover:scale-[1.02]">
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 block italic transition-colors" style={{ color: accentColor }}>Mesa {team}</span>
          <h4 className="text-2xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white leading-none">{name}</h4>
        </div>
      </div>

      <div className="relative z-10">
        <button
          onClick={async () => {
            const nextVal = !isInspectionOk;
            try {
              await fetch(`/api/matches/${matchId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [`missions${team}`]: { inspection: nextVal ? 'yes' : false } })
              });
            } catch (e) { }
          }}
          className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group/insp ${
            isInspectionOk 
            ? 'bg-[#006847]/10 border-[#006847]/30 text-[#006847]' 
            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className={`w-5 h-5 ${isInspectionOk ? 'text-[#006847]' : 'text-slate-300'}`} />
            <span className="text-xs font-black uppercase tracking-widest">Equipment Inspection</span>
          </div>
          <div className={`w-10 h-6 rounded-full relative transition-all ${isInspectionOk ? 'bg-[#006847]' : 'bg-slate-200 dark:bg-slate-800'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isInspectionOk ? 'left-5' : 'left-1'}`} />
          </div>
        </button>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="grid grid-cols-1 gap-3">
          {missionList.map(mId => {
            const val = missionValueFromMissionsFlat(mId as any, missions);
            const bounds = missionBounds[mId as any];
            const isMax = val === bounds.max && bounds.max > 0;
            return (
              <div key={mId} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isMax ? 'bg-gray-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-gray-50 dark:border-slate-800 shadow-sm'}`}>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">M{mId.padStart(2,'0')}</span>
                  <span className={`text-[11px] font-black uppercase tracking-tight leading-none transition-colors ${isMax ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-500'}`}>{MISSION_NAMES[mId] || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-950 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-inner transition-colors">
                  <button 
                    onClick={() => onUpdate(matchId, `missions${team}`, mId, -1)} 
                    disabled={val <= bounds.min} 
                    className="w-9 h-9 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 disabled:opacity-20 rounded-lg font-black text-xl transition-all active:scale-90 text-gray-400 dark:text-slate-500 shadow-sm"
                  >-</button>
                  <span className={`font-mono font-black text-lg w-7 text-center tabular-nums transition-colors ${isMax ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-600'}`} style={isMax ? { color: accentColor, textShadow: `0 0 10px ${shadowColor}` } : {}}>{val}</span>
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
