'use client';

import { useEffect, useState } from 'react';
import { Users, Trash2, Plus, Monitor, Layers, Shield, X } from 'lucide-react';
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

  useEffect(() => {
    fetchTeams();
    socket.on('timerUpdate', (data) => {
      setTimerState(data);
    });
    socket.on('alliancesUpdate', (data) => {
      if (data) {
        setAlliancesData(data);
      }
    });
    socket.emit('getAlliances');
    return () => {
      socket.off('timerUpdate');
      socket.off('alliancesUpdate');
    };
  }, []);

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
    const requiredAlliances = bracketMode === '1vs1' ? bracketSize / 2 : bracketSize / 4;
    
    if (alliancesData.alliances.length < requiredAlliances) {
        alert(`Se requieren al menos ${requiredAlliances} alianzas para un bracket de ${bracketSize} equipos.`);
        return;
    }

    const maxTeamsPerAlliance = bracketMode === '2vs2' ? 2 : 1;
    if (alliancesData.alliances.some((a: any) => a.teams.length < maxTeamsPerAlliance)) {
        alert(`Todas las alianzas deben tener ${maxTeamsPerAlliance} equipos.`);
        return;
    }

    if (!confirm('¿Generar bracket con estas alianzas? Se borrarán los datos actuales.')) return;

    try {
      const alliancesForBackend = alliancesData.alliances.map((a: any) => a.teams);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-3xl" onClick={onClose} />
      
      <div className="relative w-full max-w-7xl h-full max-h-[95vh] bg-white border border-white/20 rounded-[60px] shadow-[0_48px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-8 lg:p-10 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none italic">
                Selección de <span className="text-blue-600">Alianzas</span>
              </h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Manual Alliance Drafting</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
              <button 
                onClick={() => setBracketMode('1vs1')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${bracketMode === '1vs1' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
              >
                1 vs 1
              </button>
              <button 
                onClick={() => setBracketMode('2vs2')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${bracketMode === '2vs2' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
              >
                2 vs 2
              </button>
            </div>

            <select 
              value={bracketSize} 
              onChange={(e) => setBracketSize(Number(e.target.value))}
              className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
            >
              {[4, 8, 16, 32].map(n => <option key={n} value={n}>Top {n}</option>)}
            </select>

            <button 
              onClick={() => toggleDisplay(!isSelectionActive)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${isSelectionActive ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-gray-900 text-white shadow-gray-900/20'}`}
            >
              <Monitor className="w-4 h-4" />
              {isSelectionActive ? 'Ocultar en Pantalla' : 'Mostrar en Pantalla'}
            </button>

            <button onClick={onClose} className="w-14 h-14 bg-gray-50 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all border border-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Teams List (Left Sidebar) */}
          <div className="w-80 border-r border-gray-100 bg-gray-50/50 flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="BUSCAR EQUIPO..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="text-center py-20 text-[10px] font-black text-gray-300 uppercase tracking-widest">Cargando equipos...</div>
              ) : (
                teams
                  .filter(t => 
                    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    t.number.toString().includes(searchTerm)
                  )
                  .map(team => {
                  const isAssigned = alliancesData.alliances.some((a: any) => a.teams.includes(team.number));
                  return (
                    <div 
                      key={team.id}
                      className={`p-4 rounded-2xl border transition-all ${isAssigned ? 'opacity-30 pointer-events-none bg-gray-100 border-gray-200' : 'bg-white border-gray-100 shadow-sm hover:border-blue-500 hover:translate-x-1'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">#{team.number}</span>
                          <span className="text-[11px] font-black uppercase text-gray-900 leading-tight">{team.name}</span>
                        </div>
                        {!isAssigned && (
                          <div className="flex gap-1">
                            {alliancesData.alliances.map((a: any) => (
                              <button 
                                key={a.id}
                                onClick={() => addTeamToAlliance(a.id, team.number)}
                                className="w-8 h-8 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg flex items-center justify-center text-[10px] font-black transition-all"
                                title={`Asignar a Alianza ${a.id}`}
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
          <div className="flex-1 bg-white overflow-y-auto p-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {alliancesData.alliances.map((alliance: any) => (
                <div key={alliance.id} className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[40px] p-8 flex flex-col gap-6 relative group hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xl italic">
                        {alliance.id}
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight italic">Alianza <span className="text-blue-600">#{alliance.id}</span></h3>
                    </div>
                    <button 
                      onClick={() => removeAlliance(alliance.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: bracketMode === '2vs2' ? 2 : 1 }).map((_, idx) => {
                      const teamNum = alliance.teams[idx];
                      const team = teams.find(t => t.number === teamNum);
                      
                      return (
                        <div key={idx} className={`h-32 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${team ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-white/50 border-gray-200'}`}>
                          {team ? (
                            <>
                              <button 
                                onClick={() => removeTeamFromAlliance(alliance.id, team.number)}
                                className="absolute top-10 right-10 p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">TEAM #{team.number}</span>
                              <span className="text-sm font-black uppercase tracking-tight text-gray-900 line-clamp-2">{team.name}</span>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-300">
                              <Plus className="w-6 h-6" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Esperando Equipo</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button 
                onClick={addAlliance}
                className="h-full min-h-[250px] bg-white border-4 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-gray-300 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em]">Agregar Alianza</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Resumen</span>
              <div className="text-xl font-black text-gray-900 tabular-nums">
                {alliancesData.alliances.length} Alianzas • {alliancesData.alliances.reduce((acc: number, a: any) => acc + a.teams.length, 0)} Equipos
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={resetTournament}
              className="flex items-center gap-4 bg-red-50 hover:bg-red-100 text-[#CE1126] border border-red-200 px-8 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Reiniciar Torneo
            </button>

            <button 
              onClick={generateBracket}
              disabled={alliancesData.alliances.length === 0}
              className="flex items-center gap-4 bg-[#006847] hover:bg-[#005a3e] disabled:opacity-20 text-white px-12 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-[#006847]/20 transition-all active:scale-95 group"
            >
              <Layers className="w-5 h-5" />
              Generar Bracket con Alianzas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
