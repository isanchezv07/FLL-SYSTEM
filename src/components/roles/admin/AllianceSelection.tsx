'use client';

import { useEffect, useState } from 'react';
import { Users, Trash2, Plus, Monitor, Layers, Shield, X, Search, ChevronRight, Trophy } from 'lucide-react';
import { socket } from '@/lib/socket';

interface Team {
  id: string;
  number: string;
  name: string;
  country: string;
}

interface Alliance {
  id: number;
  teams: string[]; // Team numbers
}

export default function AllianceSelection({ onClose }: { onClose: () => void }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [alliancesData, setAlliancesData] = useState<any>({ active: false, alliances: [] });
  const [timerState, setTimerState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bracketSize, setBracketSize] = useState(8);
  const [bracketMode, setBracketMode] = useState<'1vs1' | '2vs2'>('2vs2');
  const [searchTerm, setSearchTerm] = useState('');
  const [ranking, setRanking] = useState<any[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'all' | 'ranking'>('all');

  useEffect(() => {
    fetchTeams();
    fetchRanking();

    const onTimerUpdate = (data: any) => {
      setTimerState(data);
    };
    const onAlliancesUpdate = (data: any) => {
      if (data) {
        setAlliancesData(data);
      }
    };

    socket.on('timerUpdate', onTimerUpdate);
    socket.on('alliancesUpdate', onAlliancesUpdate);
    
    socket.emit('getAlliances');

    return () => {
      socket.off('timerUpdate', onTimerUpdate);
      socket.off('alliancesUpdate', onAlliancesUpdate);
    };
  }, []);

  const fetchRanking = async () => {
    try {
      const res = await fetch('/api/ranking');
      const data = await res.json();
      setRanking(data);
    } catch (e) {
      console.error('Error fetching ranking:', e);
    }
  };

  const handleSizeChange = (newSize: number) => {
    setBracketSize(newSize);
    // REMOVED: No more automatic overwriting on size change.
    // The user must explicitly choose to auto-fill or draft manually.
  };

  const autoFillFromRanking = () => {
    if (ranking.length === 0) {
      alert('No ranking data available yet.');
      return;
    }

    if (!confirm(`This will OVERWRITE your current drafting with the TOP ${bracketSize} teams from the ranking. Continue?`)) return;

    const topTeams = ranking.slice(0, bracketSize).map(r => r.team);
    const teamsPerAlliance = bracketMode === '2vs2' ? 2 : 1;
    const newAlliances: Alliance[] = [];
    
    for (let i = 0; i < topTeams.length; i += teamsPerAlliance) {
      const allianceTeams = topTeams.slice(i, i + teamsPerAlliance);
      if (allianceTeams.length === 0) break;
      newAlliances.push({
        id: (i / teamsPerAlliance) + 1,
        teams: allianceTeams
      });
    }

    setAlliancesData((prev: any) => ({ ...prev, alliances: newAlliances }));
    saveAlliances(newAlliances);
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      const teamsList = Array.isArray(data) ? data : (data.teams || []);
      setTeams(teamsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isSelectionActive = alliancesData.active;

  const saveAlliances = (newAlliances: Alliance[]) => {
    socket.emit('updateAlliances', { 
      active: isSelectionActive, 
      alliances: newAlliances.map(a => ({
        ...a,
        teamNames: a.teams.map(num => teams.find(t => t.number === num)?.name || 'Unknown'),
        teamCountries: a.teams.map(num => teams.find(t => t.number === num)?.country || 'Unknown')
      }))
    });
  };

  const addAlliance = () => {
    const newId = alliancesData.alliances.length > 0 ? Math.max(...alliancesData.alliances.map((a: any) => a.id)) + 1 : 1;
    const updated = [...alliancesData.alliances, { id: newId, teams: [] }];
    setAlliancesData((prev: any) => ({ ...prev, alliances: updated }));
    saveAlliances(updated);
  };

  const removeAlliance = (id: number) => {
    const updated = alliancesData.alliances.filter((a: any) => a.id !== id);
    setAlliancesData((prev: any) => ({ ...prev, alliances: updated }));
    saveAlliances(updated);
  };

  const addTeamToAlliance = (allianceId: number, teamNumber: string) => {
    const updated = alliancesData.alliances.map((a: any) => {
      if (a.id === allianceId) {
        if (a.teams.includes(teamNumber)) return a;
        const maxTeams = bracketMode === '2vs2' ? 2 : 1;
        if (a.teams.length >= maxTeams) return a;
        return { ...a, teams: [...a.teams, teamNumber] };
      }
      return a;
    });
    setAlliancesData((prev: any) => ({ ...prev, alliances: updated }));
    saveAlliances(updated);
  };

  const removeTeamFromAlliance = (allianceId: number, teamNumber: string) => {
    const updated = alliancesData.alliances.map((a: any) => {
      if (a.id === allianceId) {
        return { ...a, teams: a.teams.filter((t: any) => t !== teamNumber) };
      }
      return a;
    });
    setAlliancesData((prev: any) => ({ ...prev, alliances: updated }));
    saveAlliances(updated);
  };

  const toggleDisplay = async (active: boolean) => {
    if (active) {
        await fetch('/api/brackets/reset', { method: 'POST' });
    }
    
    socket.emit('updateAlliances', { 
      active, 
      alliances: alliancesData.alliances.map((a: any) => ({
        ...a,
        teamNames: a.teams.map((num: string) => teams.find(t => t.number === num)?.name || 'Unknown'),
        teamCountries: a.teams.map((num: string) => teams.find(t => t.number === num)?.country || 'Unknown')
      }))
    });
  };

  const generateBracket = async () => {
    const teamsPerAlliance = bracketMode === '2vs2' ? 2 : 1;
    const requiredTeams = bracketSize;
    const requiredAlliances = Math.ceil(requiredTeams / teamsPerAlliance);
    
    if (alliancesData.alliances.length < requiredAlliances) {
        alert(`Se requieren al menos ${requiredAlliances} alianzas para un bracket de ${bracketSize} equipos.`);
        return;
    }

    const maxTeamsPerAlliance = teamsPerAlliance;
    if (alliancesData.alliances.some((a: any) => a.teams.length < maxTeamsPerAlliance)) {
        alert(`Todas las alianzas deben tener ${maxTeamsPerAlliance} equipos.`);
        return;
    }

    if (!confirm('¿Generar bracket con estas alianzas? Se borrarán los datos actuales.')) return;

    try {
      const alliancesForBackend = alliancesData.alliances
        .slice(0, Math.ceil(bracketSize / teamsPerAlliance))
        .map((a: any) => a.teams);
      await fetch('/api/brackets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: bracketSize, mode: bracketMode, alliances: alliancesForBackend })
      });
      alert('Bracket generado con éxito');
      toggleDisplay(false);
      onClose();
    } catch (e) {
      alert('Error al generar bracket');
    }
  };

  const resetTournament = async () => {
    if (!confirm('¿Estás seguro de REINICIAR TODO el torneo? Se borrarán matches y brackets.')) return;
    try {
      await fetch('/api/brackets/reset', { method: 'POST' });
      alert('Torneo reiniciado');
      setAlliancesData({ active: false, alliances: [] });
      socket.emit('updateAlliances', { active: false, alliances: [] });
    } catch (e) {
      alert('Error al reiniciar');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#05080a]/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[1600px] h-full max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col transition-colors">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="flex items-center gap-6 text-slate-900 dark:text-white">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight italic leading-none">
                Alliance <span className="text-blue-600">Selection</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Strategic drafting protocol
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors">
              <button 
                onClick={() => setBracketMode('1vs1')}
                className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${bracketMode === '1vs1' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                1 vs 1
              </button>
              <button 
                onClick={() => setBracketMode('2vs2')}
                className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${bracketMode === '2vs2' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                2 vs 2
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 border-x border-slate-200 dark:border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Size (Teams):</span>
                <select 
                  value={bracketSize} 
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  className="bg-transparent text-blue-600 font-bold text-sm outline-none"
                >
                  {[4, 8, 16, 32, 64, 66, 68].map(n => <option key={n} value={n} className="bg-white dark:bg-slate-900"> {n}</option>)}
                </select>
                <button 
                  onClick={autoFillFromRanking}
                  className="ml-2 p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm transition-all active:scale-95"
                  title="Auto-fill top teams from ranking"
                >
                  <Trophy className="w-3 h-3" />
                </button>
            </div>

            <button 
              onClick={() => toggleDisplay(!isSelectionActive)}
              className={`flex items-center gap-3 px-6 py-2 rounded-lg font-bold uppercase text-[10px] transition-all shadow-sm border-2 ${isSelectionActive ? 'bg-amber-500 border-amber-400 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              <Monitor className="w-4 h-4" />
              {isSelectionActive ? 'Stop Stream' : 'Live Stream'}
            </button>

            <button onClick={onClose} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Teams List (Left Sidebar) */}
          <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <button 
                  onClick={() => setSidebarTab('all')}
                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
                >
                  All Units
                </button>
                <button 
                  onClick={() => { setSidebarTab('ranking'); fetchRanking(); }}
                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'ranking' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
                >
                  By Rank
                </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="FILTER UNITS..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing...</div>
              ) : (
                (sidebarTab === 'all' ? teams : ranking.map(r => ({ ...teams.find(t => t.number === r.team), rank: ranking.indexOf(r) + 1, score: r.total })))
                  .filter((t: any) => 
                    t && (
                      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      t.number?.toString().includes(searchTerm)
                    )
                  )
                  .map((team: any) => {
                  const isAssigned = alliancesData.alliances.some((a: any) => a.teams.includes(team.number));
                  return (
                    <div 
                      key={team.id || team.number}
                      className={`p-4 rounded-lg border transition-all ${isAssigned ? 'opacity-20 grayscale pointer-events-none bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-900 hover:shadow-sm'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">#{team.number}</span>
                             {team.rank && <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded uppercase">Rank {team.rank}</span>}
                          </div>
                          <span className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-200 leading-tight truncate max-w-[120px]">{team.name}</span>
                          {team.score !== undefined && <span className="text-[9px] font-bold text-slate-400 mt-1">{team.score} PTS</span>}
                        </div>
                        {!isAssigned && (
                          <div className="flex flex-wrap justify-end gap-1 max-w-[80px]">
                            {alliancesData.alliances.map((a: any) => (
                              <button 
                                key={a.id}
                                onClick={() => addTeamToAlliance(a.id, team.number)}
                                className="w-6 h-6 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 text-slate-500 hover:text-white rounded flex items-center justify-center text-[9px] font-bold border border-slate-200 dark:border-slate-700 transition-all"
                              >
                                {a.id}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Alliances drafting area (Center) */}
          <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto p-8 custom-scrollbar relative transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {alliancesData.alliances.map((alliance: any) => (
                <div key={alliance.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col gap-6 relative transition-all hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-700 dark:text-blue-400 font-bold text-lg italic">
                        {alliance.id}
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white">Alliance Unit</h3>
                    </div>
                    <button 
                      onClick={() => removeAlliance(alliance.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-all rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {Array.from({ length: bracketMode === '2vs2' ? 2 : 1 }).map((_, idx) => {
                      const teamNum = alliance.teams[idx];
                      const team = teams.find(t => t.number === teamNum);
                      
                      return (
                        <div key={idx} className={`relative h-20 rounded-lg border-2 transition-all flex flex-col items-center justify-center px-4 text-center ${team ? 'bg-white dark:bg-slate-900 border-blue-500/30' : 'bg-slate-100 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800'}`}>
                          {team ? (
                            <>
                              <button 
                                onClick={() => removeTeamFromAlliance(alliance.id, team.number)}
                                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px]">#{team.number}</span>
                              <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-white truncate w-full">{team.name}</span>
                            </>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 uppercase italic">Awaiting Unit...</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button 
                onClick={addAlliance}
                className="h-[250px] border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
              >
                <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">New Alliance Unit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-6 transition-colors">
          <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Units</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{alliancesData.alliances.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Teams Assigned</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{alliancesData.alliances.reduce((acc: number, a: any) => acc + a.teams.length, 0)}</span>
              </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={resetTournament}
              className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-lg font-bold uppercase text-[10px] transition-all hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Terminal Reset
            </button>

            <button 
              onClick={generateBracket}
              disabled={alliancesData.alliances.length === 0}
              className="flex items-center gap-2 bg-[#0066B3] hover:bg-blue-700 disabled:opacity-30 text-white px-10 py-3 rounded-lg font-bold uppercase tracking-wider text-xs shadow-md active:scale-95 transition-all"
            >
              <Layers className="w-5 h-5" />
              Generate Official Bracket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
