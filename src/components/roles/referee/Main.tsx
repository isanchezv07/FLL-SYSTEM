import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { socket } from '@/lib/socket';

type TimerUpdate = {
  timeRemaining: number;
  isRunning: boolean;
};

// 1. Extraemos el conector (Stud) para optimizar el rendimiento (evita re-renders)
const ControllerStud = () => (
  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#0055BF] rounded-full 
    shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.3),0_4px_6px_rgba(0,0,0,0.5)] 
    border border-[#003380]" 
  />
);

export default function HeadLegoTimer() {    
  // --- LÓGICA ORIGINAL INTACTA ---
  const [timeRemaining, setTimeRemaining] = useState(150);
  const [isRunning, setIsRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);

  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startTimer = () => {
    if (timerInterval) return;
    
    setIsRunning(true);
    
    const interval = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          setTimerInterval(null);
          setIsRunning(false);
          socket.emit('updateTimer', { timeRemaining: 0, isRunning: false });
          return 0;
        }
        const newTime = prev - 1;
        socket.emit('updateTimer', { timeRemaining: newTime, isRunning: true });
        return newTime;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setIsRunning(false);
      socket.emit('updateTimer', { timeRemaining, isRunning: false });
    }
  };
  
  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTimeRemaining(150);
    setIsRunning(false);
    socket.emit('updateTimer', { timeRemaining: 150, isRunning: false });
  };

  useEffect(() => {
    socket.on('timerUpdate', (timerData: TimerUpdate) => {
      setTimeRemaining(timerData.timeRemaining);
      setIsRunning(timerData.isRunning);
    });

    socket.emit('getTimer');
    
    return () => {
      socket.off('timerUpdate');
    };
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();

        const sorted = (data || [])
          .slice()
          .sort((a: any, b: any) => (a.round ?? 0) - (b.round ?? 0) || (a.position ?? 0) - (b.position ?? 0));

        const current =
          sorted.find((m: any) => m.status === 'in_progress') ||
          sorted.find((m: any) => m.status === 'pending') ||
          sorted[0] ||
          null;

        setActiveMatch(current);

        if (current?.id) {
          localStorage.setItem('activeMatchId', current.id);
        }
      } catch (e) {
        console.error('Error fetching matches:', e);
      }
    };

    const handler = () => fetchMatches();
    const resetHandler = () => {
      localStorage.removeItem('activeMatchId');
      setActiveMatch(null);
    };

    socket.on('matchesUpdate', handler);
    socket.on('tournamentReset', resetHandler);

    fetchMatches();

    return () => {
      socket.off('matchesUpdate', handler);
      socket.off('tournamentReset', resetHandler);
    };
  }, []);

  // --- ESTILOS DINÁMICOS ---
  const getTimerColorClass = () => {
    if (timeRemaining === 0) return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]';
    if (timeRemaining <= 10) return 'text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]';
    if (timeRemaining <= 30) return 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]';
    return 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]';
  };
  
  return (
    <div className="min-h-screen bg-[#0A0F1C] relative overflow-hidden font-sans select-none">
      
      {/* Fondo Blueprint Oscuro */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,85,191,0.15)_0%,transparent_80%)]" />
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

      {/* Contenido Principal (Responsivo) */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        
        {/* Header Responsivo */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 sm:mb-12 w-full"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-lg" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            HEAD REFEREE
          </h1>
          <div className="bg-[#0055BF] text-white px-6 py-2 rounded-xl inline-block shadow-[0_8px_15px_rgba(0,0,0,0.5)] border-b-4 border-blue-800">
            <span className="text-sm sm:text-xl font-bold tracking-widest uppercase">Timer Control Panel</span>
          </div>
        </motion.div>

        {/* Match live (scoreA/scoreB) */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.2, delay: 0.05 }}
          className="w-full max-w-[95%] sm:max-w-2xl lg:max-w-4xl mb-6"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs sm:text-sm text-white/70 uppercase tracking-widest">
                  Match
                  {activeMatch?.round ? ` • Ronda ${activeMatch.round}` : ''}
                </div>
                <div className="text-lg sm:text-2xl font-black text-white drop-shadow-lg tabular-nums">
                  {activeMatch?.position ? `#${activeMatch.position}` : 'Sin match'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/60 uppercase tracking-widest">Status</div>
                <div className="text-sm sm:text-base font-bold text-white/90 capitalize">
                  {activeMatch?.status ?? '—'}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0055BF]/20 border border-[#0055BF]/30 p-3">
                <div className="text-[11px] uppercase tracking-widest text-white/70">Team A</div>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-black text-white tabular-nums">{activeMatch?.teamA || 'TBD'}</div>
                  <div className="font-black text-green-300 tabular-nums">{activeMatch?.scoreA ?? 0}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-[#0055BF]/20 border border-[#0055BF]/30 p-3">
                <div className="text-[11px] uppercase tracking-widest text-white/70">Team B</div>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-black text-white tabular-nums">{activeMatch?.teamB || 'TBD'}</div>
                  <div className="font-black text-blue-200 tabular-nums">{activeMatch?.scoreB ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel Central del Reloj */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
          className="w-full max-w-[95%] sm:max-w-2xl lg:max-w-4xl"
        >
          {/* Pieza LEGO Azul (Marco) */}
          <div className="bg-[#0055BF] p-6 sm:p-10 rounded-3xl sm:rounded-[40px] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.4),inset_5px_5px_15px_rgba(255,255,255,0.2),0_20px_40px_rgba(0,0,0,0.8)] border-b-8 border-r-8 border-[#003380] relative">
            
            {/* Studs Superiores */}
            <div className="absolute -top-3 sm:-top-4 left-8 right-8 flex justify-between">
              {Array.from({ length: 8 }).map((_, i) => <ControllerStud key={`top-${i}`} />)}
            </div>
            
            {/* Pantalla Digital (Cristal oscuro) */}
            <div className="bg-[#050914] rounded-2xl p-6 sm:p-10 shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

              <div className="text-center relative z-10 flex flex-col items-center">
                
                {/* Reloj Numérico */}
                <div className={`text-[25vw] sm:text-[120px] md:text-[150px] leading-none font-black tabular-nums tracking-tighter mb-6 ${getTimerColorClass()}`} 
                     style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                  {formatTime(timeRemaining)}
                </div>
                
                {/* Indicador de Estado LED */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 bg-white/5 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full shadow-[0_0_10px_currentColor] ${
                    isRunning ? 'bg-green-500 text-green-500 animate-pulse' : 'bg-red-500 text-red-500'
                  }`} />
                  <span className={`text-xl sm:text-2xl font-bold tracking-widest uppercase ${
                    isRunning ? 'text-green-400' : 'text-slate-400'
                  }`}>
                    {isRunning ? 'TRANSMITTING' : 'STANDBY'}
                  </span>
                </div>

                {/* BOTONES DE CONTROL (Responsivos: Columna en móviles, Fila en pantallas grandes) */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  
                  {/* Botón START */}
                  <motion.button
                    whileHover={!isRunning ? { scale: 1.03 } : {}}
                    whileTap={!isRunning ? { scale: 0.95 } : {}}
                    onClick={startTimer}
                    disabled={isRunning}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 px-6 rounded-xl font-black text-white text-lg sm:text-xl tracking-wider uppercase transition-all shadow-[0_8px_15px_rgba(0,0,0,0.3)] border-b-4 ${
                      isRunning 
                        ? 'bg-slate-700 border-slate-900 text-slate-400 cursor-not-allowed opacity-50' 
                        : 'bg-green-600 border-green-800 hover:bg-green-500 hover:-translate-y-1 active:border-b-0 active:translate-y-1'
                    }`}
                  >
                    <Play size={24} fill="currentColor" /> START
                  </motion.button>

                  {/* Botón PAUSE */}
                  <motion.button
                    whileHover={isRunning ? { scale: 1.03 } : {}}
                    whileTap={isRunning ? { scale: 0.95 } : {}}
                    onClick={pauseTimer}
                    disabled={!isRunning}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 px-6 rounded-xl font-black text-white text-lg sm:text-xl tracking-wider uppercase transition-all shadow-[0_8px_15px_rgba(0,0,0,0.3)] border-b-4 ${
                      !isRunning 
                        ? 'bg-slate-700 border-slate-900 text-slate-400 cursor-not-allowed opacity-50' 
                        : 'bg-yellow-500 border-yellow-700 hover:bg-yellow-400 hover:-translate-y-1 active:border-b-0 active:translate-y-1 text-slate-900'
                    }`}
                  >
                    <Pause size={24} fill="currentColor" /> PAUSE
                  </motion.button>

                  {/* Botón RESET */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTimer}
                    className="flex-1 flex items-center justify-center gap-2 py-4 sm:py-5 px-6 rounded-xl font-black text-white text-lg sm:text-xl tracking-wider uppercase transition-all shadow-[0_8px_15px_rgba(0,0,0,0.3)] border-b-4 bg-red-600 border-red-900 hover:bg-red-500 hover:-translate-y-1 active:border-b-0 active:translate-y-1"
                  >
                    <RotateCcw size={24} strokeWidth={3} /> RESET
                  </motion.button>

                </div>
              </div>
            </div>

            {/* Studs Inferiores */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-8 right-8 flex justify-between">
              {Array.from({ length: 8 }).map((_, i) => <ControllerStud key={`bottom-${i}`} />)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}