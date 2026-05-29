'use client';

import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import { FileJson, ChevronLeft, ChevronRight, RotateCcw, Upload, Trophy, Users, Eye, EyeOff, Radio, X, Play } from 'lucide-react';
import { toast } from 'react-toastify';

interface QualisMatch {
  alliance1: string[];
  allianceNames1?: string[];
  allianceCountries1?: string[];
  alliance2: string[];
  allianceNames2?: string[];
  allianceCountries2?: string[];
  winner?: string;
}

interface QualisData {
  matches: QualisMatch[];
  currentIndex: number;
  enabled: boolean;
  pool?: Record<string, any>;
}

export default function QualisSection() {
  const [qualisData, setQualisData] = useState<QualisData>({ matches: [], currentIndex: -1, enabled: false, pool: {} });
  const [loading, setLoading] = useState(true);
  const [editingAllianceSlot, setEditingAllianceSlot] = useState<{ index: number, slot: 1 | 2 } | null>(null);
  const [timerState, setTimerState] = useState<any>({ fields: {}, fieldCount: 14 });

  useEffect(() => {
    fetchQualis();
    const onQualisUpdate = (data: QualisData) => {
      setQualisData(data);
    };
    const onTimerUpdate = (data: any) => setTimerState(data);

    socket.on('qualisUpdate', onQualisUpdate);
    socket.on('timerUpdate', onTimerUpdate);
    
    socket.emit('getQualis');
    socket.emit('getTimer');

    return () => {
      socket.off('qualisUpdate', onQualisUpdate);
      socket.off('timerUpdate', onTimerUpdate);
    };
  }, []);

  const fetchQualis = async () => {
    try {
      const res = await fetch('/api/qualis');
      if (res.ok) {
        const data = await res.json();
        setQualisData(data);
      }
    } catch (error) {
      console.error('Error fetching qualis:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignAllianceToQualis = async (matchIndex: number, allianceKey: string, slot: 1 | 2) => {
    const alliance = qualisData.pool?.[allianceKey];
    if (!alliance) return;

    const update: any = {};
    if (slot === 1) {
      update.alliance1 = alliance.teams;
      update.allianceNames1 = alliance.teamNames;
      update.allianceCountries1 = alliance.teamCountries;
    } else {
      update.alliance2 = alliance.teams;
      update.allianceNames2 = alliance.teamNames;
      update.allianceCountries2 = alliance.teamCountries;
    }

    try {
      await fetch(`/api/qualis/match/${matchIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      setEditingAllianceSlot(null);
    } catch (e) { }
  };

  const loadQualisForPlay = async (index: number) => {
    // 1. Encontrar primera cancha libre
    let freeField = null;
    const fieldCount = timerState.fieldCount || 4;
    for (let i = 1; i <= fieldCount; i++) {
      if (!timerState.fields[`cancha${i}`]) {
        freeField = `cancha${i}`;
        break;
      }
    }

    if (!freeField) {
      toast.warning("No free fields available. Release a field to load this match.");
      return;
    }

    // 2. Asignar y resetear
    // Para Qualis, usamos un prefijo "Q-" para que el display sepa que no es un ID de match normal
    socket.emit('assignMatchToField', { fieldId: freeField, matchId: `QUAL-${index}` });
    socket.emit('resetTimer');
    toast.success(`Match loaded into ${freeField}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        
        let updatePayload: any = {};

        if (Array.isArray(json)) {
            updatePayload.matches = json;
        } else if (json.matches || json.pool) {
            updatePayload = json;
        } else {
            // Detect object of objects format (like qualis_example.json)
            const entries = Object.entries(json);
            const isPossibleMatchList = entries.length > 0 && entries.every(([_, val]) => 
                typeof val === 'object' && val !== null && ((val as any).team1 || (val as any).team2)
            );

            if (isPossibleMatchList) {
                // If it has team1 and team2, it's likely a list of 1vs1 matches
                updatePayload.matches = entries.map(([key, val]) => ({
                    ...(val as any),
                    id: key
                }));
                updatePayload.pool = json; // Also load as pool just in case
            } else {
                updatePayload.pool = json;
            }
        }
        
        if (!updatePayload.matches && qualisData.matches.length === 0) {
            updatePayload.matches = [{ alliance1: [], alliance2: [], winner: null }];
        }

        const response = await fetch('/api/qualis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...updatePayload,
            currentIndex: updatePayload.matches ? 0 : qualisData.currentIndex,
            enabled: qualisData.enabled
          })
        });

        if (response.ok) {
            const result = await response.json();
            setQualisData(result);
            toast.success(`Protocol Upload Successful: ${result.matches?.length || 0} nodes / ${Object.keys(result.pool || {}).length} pool units`);
        } else {
            toast.error('Server rejection during protocol synchronization');
        }
      } catch (error) {
        console.error('Qualis upload error:', error);
        toast.error('Invalid Protocol Data Format');
      }
    };
    reader.readAsText(file);
  };

  const addEmptyMatch = async () => {
    const newMatch = { alliance1: [], alliance2: [], winner: null };
    const updatedMatches = [...qualisData.matches, newMatch];
    await fetch('/api/qualis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matches: updatedMatches, currentIndex: qualisData.currentIndex === -1 ? 0 : qualisData.currentIndex })
    });
    toast.success('Empty node added');
  };

  const handleNext = () => socket.emit('nextQualisMatch');
  const handlePrev = () => socket.emit('prevQualisMatch');
  const handleReset = async () => {
    if (confirm('Wipe Qualis configuration?')) {
      await fetch('/api/qualis/reset', { method: 'POST' });
      toast.info('Qualis reset');
    }
  };

  const toggleQualis = async () => {
    await fetch('/api/qualis/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !qualisData.enabled })
    });
  };

  const setWinner = async (winner: string | null) => {
    if (qualisData.currentIndex === -1) return;
    await fetch(`/api/qualis/match/${qualisData.currentIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner: winner || null })
    });
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-blue-600 font-bold uppercase tracking-widest">Accessing Qualis Matrix...</div>;

  const currentMatch = qualisData.matches[qualisData.currentIndex];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-800 dark:text-slate-200 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight italic">Qualis <span className="text-blue-600 dark:text-blue-400">Scoring</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Event Qualification Phase Control</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={addEmptyMatch}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Users size={16} className="text-green-600 dark:text-green-400" />
            <span>New Score Node</span>
          </button>
          <button 
            onClick={toggleQualis}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all border shadow-sm ${
              qualisData.enabled
                ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {qualisData.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
            {qualisData.enabled ? 'Live Feed: ON' : 'Live Feed: OFF'}
          </button>
          <label className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm">
            <Upload size={16} className="text-blue-600 dark:text-blue-400" />
            <span>Import Data</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button 
            onClick={handleReset}
            className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900 transition-all shadow-sm"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 transition-all">
        {/* Scoring Console (Main) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
            <div className="bg-slate-800 dark:bg-black text-white px-6 py-4 flex justify-between items-center transition-colors">
              <h3 className="font-bold uppercase tracking-tight text-sm flex items-center gap-3">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" /> 
                Tactical Entry Sheet
              </h3>
              <div className="flex items-center gap-4">
                {currentMatch && (
                  <button 
                    onClick={() => loadQualisForPlay(qualisData.currentIndex)}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Play size={12} fill="currentColor" /> Load to Field
                  </button>
                )}
                {currentMatch && <span className="bg-white/10 dark:bg-slate-800 px-3 py-1 rounded text-[10px] font-bold">NODE {qualisData.currentIndex + 1}</span>}
              </div>
            </div>
            
            {qualisData.currentIndex === -1 || !currentMatch ? (
              <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
                <FileJson size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold uppercase tracking-widest text-[10px] text-slate-400 dark:text-slate-600">System Standby: Select Node from Registry</p>
              </div>
            ) : (
              <div className="p-8 space-y-8 bg-slate-50/30 dark:bg-slate-950/20 transition-colors">
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-8">
                  {/* Blue Alliance */}
                  <div 
                    className={`flex-1 p-8 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-6 relative group ${currentMatch.winner === '1' ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-400 shadow-lg ring-1 ring-blue-600 dark:ring-blue-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700'}`}
                    onClick={() => setWinner(currentMatch.winner === '1' ? null : '1')}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingAllianceSlot({ index: qualisData.currentIndex, slot: 1 }); }}
                      className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded text-slate-400 dark:text-slate-500 transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                      <Users size={14} />
                    </button>

                    <div className="flex justify-between items-center">
                      <div className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">Blue Alliance</div>
                      {currentMatch.winner === '1' && <Trophy size={16} className="text-blue-600 dark:text-blue-400 fill-current animate-bounce" />}
                    </div>
                    
                    <div className="space-y-4">
                      {currentMatch.alliance1?.length > 0 ? currentMatch.alliance1.map((teamNum: string, idx: number) => (
                        <div key={idx} className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 mb-0.5 transition-colors">#{teamNum}</span>
                          <span className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight leading-tight italic truncate max-w-[200px] transition-colors">{currentMatch.allianceNames1?.[idx] || `Team ${teamNum}`}</span>
                        </div>
                      )) : (
                        <div className="py-4 text-slate-300 dark:text-slate-700 font-bold uppercase text-[10px] italic transition-colors">No Team Assigned</div>
                      )}
                    </div>

                    {currentMatch.winner === '1' && (
                      <div className="mt-2 text-center bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md">
                        Commited Winner
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="text-3xl font-black text-slate-300 dark:text-slate-700 italic select-none transition-colors">VS</div>
                  </div>
                  
                  {/* Red Alliance */}
                  <div 
                    className={`flex-1 p-8 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-6 relative group ${currentMatch.winner === '2' ? 'bg-white dark:bg-slate-900 border-red-600 dark:border-red-500 shadow-lg ring-1 ring-red-600 dark:ring-red-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-700'}`}
                    onClick={() => setWinner(currentMatch.winner === '2' ? null : '2')}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingAllianceSlot({ index: qualisData.currentIndex, slot: 2 }); }}
                      className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded text-slate-400 dark:text-slate-500 transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                      <Users size={14} />
                    </button>

                    <div className="flex justify-between items-center">
                      <div className="text-red-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">Red Alliance</div>
                      {currentMatch.winner === '2' && <Trophy size={16} className="text-red-600 dark:text-red-500 fill-current animate-bounce" />}
                    </div>
                    
                    <div className="space-y-4">
                      {currentMatch.alliance2?.length > 0 ? currentMatch.alliance2.map((teamNum: string, idx: number) => (
                        <div key={idx} className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 mb-0.5 transition-colors">#{teamNum}</span>
                          <span className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight leading-tight italic truncate max-w-[200px] transition-colors">{currentMatch.allianceNames2?.[idx] || `Team ${teamNum}`}</span>
                        </div>
                      )) : (
                        <div className="py-4 text-slate-300 dark:text-slate-700 font-bold uppercase text-[10px] italic transition-colors">No Team Assigned</div>
                      )}
                    </div>

                    {currentMatch.winner === '2' && (
                      <div className="mt-2 text-center bg-red-600 dark:bg-red-700 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md">
                        Commited Winner
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                  <button 
                    onClick={handlePrev}
                    disabled={qualisData.currentIndex <= 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-bold text-xs uppercase transition-all active:scale-95 shadow-sm"
                  >
                    <ChevronLeft size={16}/> Previous
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={qualisData.currentIndex >= qualisData.matches.length - 1}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0066B3] dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-30 text-white py-3 rounded-lg font-bold text-xs uppercase transition-all active:scale-95 shadow-md"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Node Registry (Right) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden flex flex-col h-[700px] transition-colors">
            <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 transition-colors">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight flex items-center gap-2">
                    <Users className="text-blue-600 dark:text-blue-400 w-4 h-4" /> Registry ({qualisData.matches.length})
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar transition-colors">
              {qualisData.matches.map((m, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                    idx === qualisData.currentIndex 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500 shadow-sm ring-1 ring-blue-600 dark:ring-blue-500' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => socket.emit('updateQualis', { currentIndex: idx })}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      idx === qualisData.currentIndex ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      M {idx + 1}
                    </span>
                    {m.winner && (
                      <Trophy size={12} className={idx === qualisData.currentIndex ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'} />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className={`text-[10px] font-bold truncate uppercase tracking-tight ${idx === qualisData.currentIndex ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      <div className="w-1 h-3 bg-blue-600 inline-block mr-1.5 rounded-full" />
                      {m.allianceNames1?.join(' + ') || m.alliance1?.join(' + ') || '---'}
                    </div>
                    <div className={`text-[10px] font-bold truncate uppercase tracking-tight ${idx === qualisData.currentIndex ? 'text-red-700 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      <div className="w-1 h-3 bg-red-600 inline-block mr-1.5 rounded-full" />
                      {m.allianceNames2?.join(' + ') || m.alliance2?.join(' + ') || '---'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Selection Overlay */}
      {editingAllianceSlot && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-[#0066B3] dark:bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold uppercase tracking-tight">Assign Competitive Unit</h2>
              <button onClick={() => setEditingAllianceSlot(null)} className="hover:bg-white/10 p-1 rounded transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto bg-slate-50 dark:bg-slate-950 custom-scrollbar transition-colors">
              {qualisData.pool ? (
                Object.entries(qualisData.pool).map(([key, p]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => assignAllianceToQualis(editingAllianceSlot.index, key, editingAllianceSlot.slot)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{key}</div>
                    <div className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                      {p.teamNames?.join(' + ') || 'Unknown Unit'}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 italic text-xs">No Alliance Pool Available</div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end transition-colors">
                <button 
                  onClick={() => setEditingAllianceSlot(null)}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-bold uppercase text-[10px] transition-all"
                >
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
