'use client';

import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import { FileJson, ChevronLeft, ChevronRight, RotateCcw, Upload, Trophy, Users, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

interface QualisMatch {
  team1: string;
  team2: string;
  winner?: string;
}

interface QualisData {
  matches: QualisMatch[];
  currentIndex: number;
  enabled: boolean;
}

export default function QualisSection() {
  const [qualisData, setQualisData] = useState<QualisData>({ matches: [], currentIndex: -1, enabled: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualis();
    socket.on('qualisUpdate', (data: QualisData) => {
      setQualisData(data);
    });
    return () => {
      socket.off('qualisUpdate');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const matches = Array.isArray(json) ? json : (json.matches || []);
        
        const response = await fetch('/api/qualis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            matches, 
            currentIndex: 0,
            enabled: qualisData.enabled // Mantener el estado actual de habilitación
          })
        });

        if (response.ok) {
          toast.success('Matches de Qualis cargados y sincronizados');
        } else {
          toast.error('Error al guardar los matches');
        }
      } catch (error) {
        toast.error('Archivo JSON inválido');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleNext = () => socket.emit('nextQualisMatch');
  const handlePrev = () => socket.emit('prevQualisMatch');
  const handleReset = async () => {
    if (confirm('¿Estás seguro de resetear el modo Qualis?')) {
      await fetch('/api/qualis/reset', { method: 'POST' });
      toast.info('Modo Qualis reseteado');
    }
  };

  const toggleQualis = async () => {
    const response = await fetch('/api/qualis/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !qualisData.enabled })
    });
    if (response.ok) {
      toast.success(qualisData.enabled ? 'Modo Qualis DESACTIVADO' : 'Modo Qualis ACTIVADO');
    }
  };

  const setWinner = async (winner: string | null) => {
    if (qualisData.currentIndex === -1) return;
    await fetch(`/api/qualis/match/${qualisData.currentIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner: winner || null })
    });
    toast.success(winner ? `Ganador declarado: ${winner}` : 'Ganador reseteado');
  };

  if (loading) return <div className="p-8 text-white">Cargando Qualis...</div>;

  const currentMatch = qualisData.matches[qualisData.currentIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Modo Qualis</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Control del display /timer en modo Qualis</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={toggleQualis}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border-2 ${
              qualisData.enabled
                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {qualisData.enabled ? <EyeOff size={18} /> : <Eye size={18} />}
            {qualisData.enabled ? 'DESACTIVAR EN TIMER' : 'ACTIVAR EN TIMER'}
          </button>
          <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-bold transition-all cursor-pointer border border-slate-700">
            <Upload size={20} />
            <span>CARGAR JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button 
            onClick={handleReset}
            className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controles y Match Actual */}
        <div className="space-y-8">
          <div className="bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Match Actual
            </h3>
            
            {qualisData.currentIndex === -1 || !currentMatch ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
                <FileJson size={48} className="mx-auto mb-4 opacity-20" />
                <p>No hay matches cargados o seleccionados</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className={`flex-1 p-6 rounded-3xl border transition-all cursor-pointer ${currentMatch.winner === currentMatch.team1 ? 'bg-green-600 border-green-400' : 'bg-slate-800/50 border-slate-700'}`} onClick={() => setWinner(currentMatch.winner === currentMatch.team1 ? null : currentMatch.team1)}>
                    <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">TEAM 1</div>
                    <div className="text-2xl font-black text-white">{currentMatch.team1}</div>
                    {currentMatch.winner === currentMatch.team1 && <div className="text-[10px] font-bold text-white mt-2">GANADOR</div>}
                  </div>
                  <div className="text-2xl font-black text-blue-500">VS</div>
                  <div className={`flex-1 p-6 rounded-3xl border transition-all cursor-pointer ${currentMatch.winner === currentMatch.team2 ? 'bg-green-600 border-green-400' : 'bg-slate-800/50 border-slate-700'}`} onClick={() => setWinner(currentMatch.winner === currentMatch.team2 ? null : currentMatch.team2)}>
                    <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">TEAM 2</div>
                    <div className="text-2xl font-black text-white">{currentMatch.team2}</div>
                    {currentMatch.winner === currentMatch.team2 && <div className="text-[10px] font-bold text-white mt-2">GANADOR</div>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setWinner(null)} className="w-full py-2 text-xs font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest">Limpiar Ganador</button>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handlePrev}
                    disabled={qualisData.currentIndex <= 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all"
                  >
                    <ChevronLeft /> ANTERIOR
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={qualisData.currentIndex >= qualisData.matches.length - 1}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    SIGUIENTE <ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-[40px] p-8">
            <h4 className="text-blue-500 font-black uppercase tracking-widest text-[11px] mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Instrucciones Qualis
            </h4>
            <ul className="text-slate-400 text-xs space-y-3 leading-relaxed">
              <li>• Haz clic en la tarjeta de un equipo para declararlo <strong>ganador</strong>.</li>
              <li>• Activa el modo para que se vea en todas las pantallas <strong>/timer</strong>.</li>
              <li>• El avance de match sincroniza automáticamente el display.</li>
            </ul>
          </div>
        </div>

        {/* Lista de Matches */}
        <div className="bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl overflow-hidden flex flex-col h-[600px]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="text-blue-500" /> Lista de Matches ({qualisData.matches.length})
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-4 space-y-2 custom-scrollbar">
            {qualisData.matches.map((m, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  idx === qualisData.currentIndex 
                  ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                    idx === qualisData.currentIndex ? 'bg-white text-blue-600' : 'bg-slate-700 text-slate-400'
                  }`}>
                    MATCH {idx + 1}
                  </span>
                  {m.winner && (
                    <Trophy size={14} className={idx === qualisData.currentIndex ? 'text-white' : 'text-yellow-500'} />
                  )}
                </div>
                <div className="flex justify-between mt-2 font-bold text-sm">
                  <span className={idx === qualisData.currentIndex ? 'text-white' : 'text-slate-300'}>{m.team1}</span>
                  <span className={idx === qualisData.currentIndex ? 'text-blue-200' : 'text-slate-500'}>vs</span>
                  <span className={idx === qualisData.currentIndex ? 'text-white' : 'text-slate-300'}>{m.team2}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}