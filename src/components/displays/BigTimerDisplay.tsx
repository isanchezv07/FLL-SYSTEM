'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '@/lib/socket';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
}

interface WinnerInfo {
  alliance: 'A' | 'B';
  team1: string;
  team2: string;
  score: number;
}

export default function LegoTimerDisplay() {
  const [timer, setTimer] = useState<TimerState>({ timeRemaining: 150, isRunning: false });
  const [isConnected, setIsConnected] = useState(true);
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [winner, setWinner] = useState<WinnerInfo | null>(null);
  const [nextMatchCountdown, setNextMatchCountdown] = useState(10);
  
  const victoryAudio = useRef<HTMLAudioElement | null>(null);

  const fetchActiveMatch = useCallback(async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const sorted = list.sort((a: any, b: any) => (a.round ?? 0) - (b.round ?? 0) || (a.position ?? 0) - (b.position ?? 0));
      const picked = sorted.find((m: any) => m?.status === 'in_progress') || sorted.find((m: any) => m?.status === 'pending') || sorted[0] || null;
      setActiveMatch(picked);
    } catch { }
  }, []);

  useEffect(() => {
    // Inicializar audio
    victoryAudio.current = new Audio('/sounds/end_match(7).wav');

    socket.on('timerUpdate', (data) => setTimer(data));
    socket.on('matchesUpdate', fetchActiveMatch);
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    socket.on('matchWinnerDeclared', (data: WinnerInfo) => {
      setWinner(data);
      setNextMatchCountdown(10);
      
      // Reproducir sonido de victoria
      victoryAudio.current?.play().catch(e => console.log("Audio play blocked"));

      // Confetti continuo
      const end = Date.now() + 7 * 1000;
      const colors = data.alliance === 'A' ? ['#2563eb', '#ffffff', '#60a5fa'] : ['#dc2626', '#ffffff', '#f87171'];

      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());

      // Timer para quitar la pantalla de victoria
      const interval = setInterval(() => {
        setNextMatchCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setWinner(null);
            fetchActiveMatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });
    
    fetchActiveMatch();
    socket.emit('getTimer');

    return () => {
      socket.off('timerUpdate');
      socket.off('matchesUpdate');
      socket.off('matchWinnerDeclared');
    };
  }, [fetchActiveMatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCritical = timer.timeRemaining <= 30 && timer.isRunning;

  return (
    <div className="h-screen w-screen bg-[#020617] text-white relative overflow-hidden font-sans flex flex-col p-6 lg:p-10 selection:bg-none">
      
      {/* 🌌 FONDO DINÁMICO */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isCritical ? 'bg-red-600/15' : 'bg-blue-600/10'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isCritical ? 'bg-red-900/15' : 'bg-indigo-600/10'}`} />
      </div>

      <AnimatePresence>
        {winner ? (
          /* 🎊 PANTALLA DE VICTORIA LEGO STYLE 🎊 */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 p-10 text-center"
          >
            {/* Patrón de Bricks de Fondo */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
            
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              className={`w-40 h-40 rounded-[48px] flex items-center justify-center mb-10 border-b-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${winner.alliance === 'A' ? 'bg-blue-600 border-blue-800' : 'bg-red-600 border-red-800'}`}
            >
              <Trophy className="text-yellow-400 w-20 h-20 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[3vw] font-black uppercase tracking-[0.5em] text-slate-500 mb-2"
            >
              Victory Declared
            </motion.h2>

            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-[12vw] font-black uppercase tracking-tighter leading-none mb-10 ${winner.alliance === 'A' ? 'text-blue-500' : 'text-red-500'} drop-shadow-[0_0_60px_currentColor]`}
            >
              Alliance {winner.alliance === 'A' ? 'Alpha' : 'Bravo'}
            </motion.h1>

            <div className="flex gap-16 items-center justify-center bg-slate-900/80 backdrop-blur-md p-12 rounded-[60px] border-2 border-slate-800 shadow-2xl relative">
              <div className="text-left space-y-2">
                <div className="text-[2vw] font-black text-white uppercase tracking-tight">{winner.team1}</div>
                <div className="text-[2vw] font-black text-slate-400 uppercase tracking-tight">{winner.team2}</div>
              </div>
              <div className="w-1 h-24 bg-slate-800 rounded-full" />
              <div className="text-center">
                <div className="text-slate-500 text-[1.2vw] font-black uppercase tracking-widest mb-2">Final Points</div>
                <div className="text-[8vw] font-black font-mono leading-none text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">{winner.score}</div>
              </div>
            </div>

            {/* Barra de progreso para el siguiente match */}
            <div className="mt-16 w-full max-w-2xl space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                <span>Next match setup</span>
                <span>{nextMatchCountdown}s</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          /* 🕹️ PANTALLA NORMAL DEL TIMER (IGUAL A LA ANTERIOR) */
          <>
            <motion.header 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative z-10 flex justify-between items-end border-b-2 border-slate-800/50 pb-6 mb-4"
            >
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="bg-blue-600 px-6 py-2 rounded-lg shadow-lg skew-x-[-12deg]">
                    <span className="text-3xl font-black italic block skew-x-[12deg]">FLL</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter text-white/90">Championship <span className="text-blue-500">2026</span></h1>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Live Digital Feed</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Session Info</div>
                <div className="text-2xl font-black text-white uppercase tracking-tight">
                  {activeMatch ? `Match #${activeMatch.position} • Round ${activeMatch.round}` : 'Arena Standby'}
                </div>
              </div>
            </motion.header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
              <motion.div animate={isCritical ? { scale: [1, 1.03, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}>
                <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-[60px] border border-slate-700/50 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                  <div className="bg-slate-950 px-16 py-10 lg:px-24 lg:py-14 rounded-[50px] shadow-[inset_0_10px_30px_rgba(0,0,0,1)] border-2 border-slate-800 text-center relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={timer.timeRemaining}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-[25vh] leading-[0.8] font-black tabular-nums tracking-tighter ${
                          timer.timeRemaining <= 10 ? 'text-red-500' : timer.timeRemaining <= 30 ? 'text-amber-400' : 'text-white'
                        }`}
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                      >
                        {formatTime(timer.timeRemaining)}
                      </motion.div>
                    </AnimatePresence>
                    <div className="mt-8 flex items-center justify-center gap-6">
                      <div className={`h-1.5 w-24 rounded-full ${timer.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'}`} />
                      <span className={`text-sm font-black uppercase tracking-[0.6em] ${timer.isRunning ? 'text-emerald-500' : 'text-slate-600'}`}>
                        {timer.isRunning ? 'Active Engine' : 'Match Paused'}
                      </span>
                      <div className={`h-1.5 w-24 rounded-full ${timer.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </main>

            <footer className="relative z-10 grid grid-cols-2 gap-8 h-[22vh]">
              {/* Alliance A */}
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border-l-8 border-blue-600 p-6 flex flex-col justify-between shadow-2xl overflow-hidden relative">
                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-1">
                    <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Alliance Alpha</div>
                    <div className="text-2xl font-black text-white uppercase truncate max-w-[250px]">{activeMatch?.teamA1 || 'TBD'}</div>
                    <div className="text-xl font-bold text-slate-500 uppercase truncate max-w-[250px]">{activeMatch?.teamA2 || 'TBD'}</div>
                  </div>
                  <div className="text-blue-400 font-mono text-7xl font-black tabular-nums leading-none tracking-tighter">{activeMatch?.scoreA || 0}</div>
                </div>
                <div className="w-full bg-slate-950/50 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((activeMatch?.scoreA || 0) / 400) * 100, 100)}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </motion.div>

              {/* Alliance B */}
              <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border-r-8 border-red-600 p-6 flex flex-col justify-between shadow-2xl overflow-hidden relative">
                <div className="flex justify-between items-center relative z-10">
                  <div className="text-red-400 font-mono text-7xl font-black tabular-nums leading-none tracking-tighter order-2">{activeMatch?.scoreB || 0}</div>
                  <div className="space-y-1 order-1">
                    <div className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">Alliance Bravo</div>
                    <div className="text-2xl font-black text-white uppercase truncate max-w-[250px]">{activeMatch?.teamB1 || 'TBD'}</div>
                    <div className="text-xl font-bold text-slate-500 uppercase truncate max-w-[250px]">{activeMatch?.teamB2 || 'TBD'}</div>
                  </div>
                </div>
                <div className="w-full bg-slate-950/50 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((activeMatch?.scoreB || 0) / 400) * 100, 100)}%` }} className="h-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
              </motion.div>
            </footer>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
