'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '@/lib/socket';
import confetti from 'canvas-confetti';
import { Trophy, Megaphone, Shield } from 'lucide-react';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  fieldCount: number;
  fields?: Record<string, string | null>;
}

interface WinnerInfo {
  alliance: 'A' | 'B';
  team1: string;
  team2: string;
  score: number;
}

export default function LegoTimerDisplay() {
  const [timer, setTimer] = useState<TimerState>({ timeRemaining: 150, isRunning: false, fieldCount: 4, fields: {} });
  const [alliances, setAlliances] = useState<any>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [winner, setWinner] = useState<WinnerInfo | null>(null);
  const [nextMatchCountdown, setNextMatchCountdown] = useState(10);
  const [awardsData, setAwardsData] = useState<any>({ awards: [], announcement: { text: '', active: false }, ceremonyMode: false });
  const [qualisData, setQualisData] = useState<any>({ matches: [], currentIndex: -1, enabled: false });
  
  const victoryAudio = useRef<HTMLAudioElement | null>(null);
  const awardRevealAudio = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs para evitar bucles de dependencia y re-registros de socket
  const activeMatchRef = useRef<any>(null);
  const selectedFieldRef = useRef<string | null>(null);
  const timerFieldsRef = useRef<Record<string, string | null>>({});
  const lastRevealedAwardId = useRef<string | null>(null);
  const qualisDataRef = useRef<any>({ matches: [], currentIndex: -1, enabled: false });

  // Load selected field from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedField');
    if (saved) {
      setSelectedField(saved);
      selectedFieldRef.current = saved;
    }
    // Inicializar audio
    victoryAudio.current = new Audio('/sounds/end_match(7).wav');
    awardRevealAudio.current = new Audio('/sounds/start_bell(5).wav');
  }, []);

  const lastFetchTime = useRef<number>(0);

  const fetchActiveMatch = useCallback(async () => {
    // Throttle: No más de una petición cada 2 segundos para la lista completa
    const now = Date.now();
    if (now - lastFetchTime.current < 2000) return;
    lastFetchTime.current = now;

    try {
      const currentField = selectedFieldRef.current;
      const currentFields = timerFieldsRef.current;

      if (!currentField || !currentFields?.[currentField]) {
        const res = await fetch('/api/matches');
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const sorted = list.sort((a: any, b: any) => (a.round ?? 0) - (b.round ?? 0) || (a.position ?? 0) - (b.position ?? 0));
        const picked = sorted.find((m: any) => m?.status === 'in_progress') || sorted.find((m: any) => m?.status === 'pending') || sorted[0] || null;
        
        if (activeMatchRef.current?.id !== picked?.id) {
          setActiveMatch(picked);
          activeMatchRef.current = picked;
        }
        return;
      }

      const matchId = currentFields[currentField];
      if (activeMatchRef.current?.id === matchId) return;

      const res = await fetch(`/api/matches/${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveMatch(data);
        activeMatchRef.current = data;
      }
    } catch { }
  }, []);

  const fetchQualis = useCallback(async () => {
    try {
      const res = await fetch('/api/qualis');
      if (res.ok) {
        const data = await res.json();
        setQualisData(data);
        qualisDataRef.current = data;
      }
    } catch { }
  }, []);

  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(fieldId);
    selectedFieldRef.current = fieldId;
    localStorage.setItem('selectedField', fieldId);
    fetchActiveMatch();
  };

  useEffect(() => {
    socket.on('timerUpdate', (data) => {
      setTimer(data);
      timerFieldsRef.current = data.fields || {};
    });
    socket.on('alliancesUpdate', (data) => setAlliances(data));
    socket.on('matchesUpdate', () => fetchActiveMatch());
    socket.on('awardsUpdate', (data) => setAwardsData(data));
    socket.on('qualisUpdate', (data) => {
      const prev = qualisDataRef.current;
      const currentMatch = data.matches[data.currentIndex];
      const prevMatch = prev.matches[prev.currentIndex];
      
      // Reset any ongoing confetti when changing matches
      if (data.currentIndex !== prev.currentIndex) {
        confetti.reset();
      }

      // Trigger confetti ONLY if:
      // 1. Qualis display is enabled
      // 2. Current match has a winner
      // 3. We are on the SAME match AND the winner just changed
      if (data.enabled && currentMatch?.winner && 
         (data.currentIndex === prev.currentIndex && currentMatch.winner !== prevMatch?.winner)) {
        triggerQualisConfetti();
      }
      
      qualisDataRef.current = data;
      setQualisData(data);
    });
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on('matchUpdate', (updatedMatch: any) => {
      if (activeMatchRef.current?.id === updatedMatch.id) {
        setActiveMatch(prev => {
          const newState = { ...prev, ...updatedMatch };
          activeMatchRef.current = newState;
          return newState;
        });
      }
    });
    
    socket.on('matchWinnerDeclared', (data: WinnerInfo) => {
      const currentActive = activeMatchRef.current;
      if (currentActive?.teamA1 === data.team1 || currentActive?.teamB1 === data.team1) {
        confetti.reset(); // Stop previous animations
        setWinner(data);
        setNextMatchCountdown(10);
        
        victoryAudio.current?.play().catch(e => console.log("Audio play blocked"));
        const end = Date.now() + 5 * 1000;
        const colors = ['#FFD700', '#FFA500', '#FACC15', '#FFFFFF'];
        (function frame() {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());

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
        }, 500);
      }
    });
    
    fetchActiveMatch();
    fetchQualis();
    socket.emit('getTimer');
    socket.emit('getAwards');
    socket.emit('getQualis');

    return () => {
      socket.off('timerUpdate');
      socket.off('alliancesUpdate');
      socket.off('matchesUpdate');
      socket.off('awardsUpdate');
      socket.off('matchUpdate');
      socket.off('matchWinnerDeclared');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [fetchActiveMatch]);

  const triggerConfetti = () => {
    const end = Date.now() + 7 * 1000;
    const colors = winner?.alliance === 'A' ? ['#2563eb', '#ffffff', '#60a5fa'] : ['#dc2626', '#ffffff', '#f87171'];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const triggerQualisConfetti = () => {
    confetti.reset();
    const end = Date.now() + 3 * 1000;
    const colors = ['#FFD700', '#FFA500', '#FACC15', '#FFFFFF'];
    (function frame() {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  // Efecto para detectar cuando se revela un ganador y lanzar confeti
  useEffect(() => {
    const revealedAward = awardsData?.awards?.find((a: any) => a.revealedWinner);
  
    if (revealedAward && revealedAward.id !== lastRevealedAwardId.current) {
      lastRevealedAwardId.current = revealedAward.id;
      
      awardRevealAudio.current?.play().catch(() => {});
      
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const prizeColors = ['#FFD700', '#D4AF37', '#FDF5E6', '#C0C0C0', '#FFFFFF'];
  
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
  
      const particleCount = 45; 
        const defaults = {
          startVelocity: 45,
          spread: 90,
          ticks: 200,
          zIndex: 200,
          colors: prizeColors,
          gravity: 0.7,
          scalar: 1.2,
        };
  
        confetti({ ...defaults, particleCount, angle: 65, origin: { x: -0.1, y: 0.7 } });
        confetti({ ...defaults, particleCount, angle: 115, origin: { x: 1.1, y: 0.7 } });
      }, 200);

      return () => clearInterval(interval);
    } else if (!revealedAward) {
      lastRevealedAwardId.current = null;
    }
  }, [awardsData?.awards]);

  const revealedAwardTitle = awardsData?.awards?.find((a: any) => a.revealedTitle);
  const activeAnnouncement = awardsData?.announcement?.active ? awardsData.announcement.text : null;
  const isCeremonyMode = awardsData?.ceremonyMode;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCritical = timer.timeRemaining <= 30 && timer.isRunning;
  const currentQualisMatch = qualisData.matches[qualisData.currentIndex];

  return (
    <div ref={containerRef} className="h-screen w-screen bg-[#020617] text-white relative overflow-hidden font-sans flex flex-col p-6 lg:p-10 selection:bg-none">
      
      {!selectedField && !qualisData.enabled && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-10 text-blue-500">Seleccionar Cancha</h2>
          <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
            {Array.from({ length: timer.fieldCount || 4 }).map((_, idx) => {
              const f = `cancha${idx + 1}`;
              return (
                <button 
                  key={f}
                  onClick={() => handleFieldSelect(f)}
                  className="bg-slate-900 hover:bg-blue-600 border-2 border-slate-800 p-10 rounded-3xl text-2xl font-black uppercase transition-all"
                >
                  {f.replace('cancha', 'Cancha ')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isCritical ? 'bg-red-600/15' : 'bg-blue-600/10'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isCritical ? 'bg-red-900/15' : 'bg-indigo-600/10'}`} />
      </div>

      <AnimatePresence mode="wait">
        {activeAnnouncement ? (
          <motion.div
            key="announcement"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-blue-950/90 backdrop-blur-3xl p-20 text-center"
          >
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '60px 60px' }} />
             <div className="bg-blue-600 p-8 rounded-[40px] mb-12 shadow-2xl shadow-blue-500/20">
               <Megaphone className="w-24 h-24 text-white" />
             </div>
             <h2 className="text-4xl font-black uppercase tracking-[0.4em] text-blue-400 mb-8">Comunicado Oficial</h2>
             <div className="max-w-6xl">
               <p className="text-[6vw] font-black leading-tight text-white uppercase tracking-tighter">
                 {activeAnnouncement}
               </p>
             </div>
          </motion.div>
        ) : qualisData.enabled ? (
          <motion.div
            key="qualis"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 p-10"
          >
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
             
             {!currentQualisMatch ? (
               <div className="text-white/20 text-4xl font-black uppercase tracking-widest">MODO QUALIS</div>
             ) : (
               <div className="w-full max-w-7xl flex flex-col items-center gap-12">
                  <div className="flex flex-col items-center mb-4">
                    <div className="bg-blue-600 px-6 py-2 rounded-full text-white font-black text-sm tracking-[0.3em] uppercase mb-4 shadow-xl shadow-blue-500/20">
                      QUALIFYING MATCH #{qualisData.currentIndex + 1}
                    </div>
                    <h2 className="text-white/40 text-2xl font-black uppercase tracking-tighter">ENFRENTAMIENTO</h2>
                  </div>

                  <div className="flex items-center justify-center gap-16 w-full">
                    {/* Team 1 */}
                    <div className="flex-1 flex flex-col items-end text-right gap-6">
                      <div className={`p-8 rounded-[40px] border-4 transition-all duration-700 w-full ${
                        currentQualisMatch.winner === currentQualisMatch.team1 
                        ? 'bg-green-600 border-green-400 shadow-[0_0_80px_rgba(34,197,94,0.3)] scale-105' 
                        : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="text-white/40 text-sm font-black uppercase mb-2 tracking-widest">TEAM 1</div>
                        <div className="text-5xl md:text-7xl font-black text-white truncate">{currentQualisMatch.team1}</div>
                      </div>
                      {currentQualisMatch.winner === currentQualisMatch.team1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-green-400 font-black text-2xl">
                          <Trophy size={32} /> GANADOR
                        </motion.div>
                      )}
                    </div>

                    <div className="text-6xl font-black text-blue-500 italic px-4">VS</div>

                    {/* Team 2 */}
                    <div className="flex-1 flex flex-col items-start text-left gap-6">
                      <div className={`p-8 rounded-[40px] border-4 transition-all duration-700 w-full ${
                        currentQualisMatch.winner === currentQualisMatch.team2 
                        ? 'bg-green-600 border-green-400 shadow-[0_0_80px_rgba(34,197,94,0.3)] scale-105' 
                        : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="text-white/40 text-sm font-black uppercase mb-2 tracking-widest">TEAM 2</div>
                        <div className="text-5xl md:text-7xl font-black text-white truncate">{currentQualisMatch.team2}</div>
                      </div>
                      {currentQualisMatch.winner === currentQualisMatch.team2 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-green-400 font-black text-2xl">
                          GANADOR <Trophy size={32} />
                        </motion.div>
                      )}
                    </div>
                  </div>
               </div>
             )}
          </motion.div>
        ) : alliances?.active ? (
          <motion.div
            key="alliance-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-[#020617] p-10 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/5 blur-[120px] rounded-full" />

            <div className="relative z-10 w-full max-w-[90vw] flex flex-col items-center">
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-[5vw] font-black uppercase tracking-tighter italic text-white leading-none">
                  Draft de <span className="text-blue-500">Alianzas</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-4 gap-6 w-full">
                {alliances.alliances.map((alliance: any, idx: number) => (
                  <motion.div
                    key={alliance.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[40px] p-8 flex flex-col items-center shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
                      <span className="text-2xl font-black italic text-blue-500">{alliance.id}</span>
                    </div>
                    <div className="space-y-4 w-full">
                      {alliance.teamNames.map((name: string, tIdx: number) => (
                        <div key={tIdx} className="text-center">
                          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Equipo {tIdx + 1}</div>
                          <div className="text-xl font-black text-white uppercase tracking-tight leading-tight line-clamp-2">{name}</div>
                          <div className="text-[10px] font-mono font-bold text-slate-500 mt-1">#{alliance.teams[tIdx]}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : revealedAwardTitle ? (
          <motion.div
            key="award"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-slate-950 p-20 text-center"
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fbbf24 2px, transparent 2px)', backgroundSize: '50px 50px' }} />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {[...Array(20)].map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, scale: 0 }}
                   animate={{ 
                     opacity: [0, 1, 0], 
                     scale: [0, 1, 0],
                     x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                     y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`]
                   }}
                   transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
                   className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-[2px]"
                 />
               ))}
            </div>

            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-48 h-48 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-[50px] flex items-center justify-center mb-12 shadow-[0_0_80px_rgba(251,191,36,0.3)] border-b-[16px] border-amber-800"
            >
              <Trophy className="w-24 h-24 text-white drop-shadow-lg" />
            </motion.div>

            <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-amber-500 mb-4">{revealedAwardTitle.name}</h2>
            <div className="text-[2vw] font-bold text-slate-500 uppercase tracking-widest mb-12">Award Category</div>

            <AnimatePresence mode="wait">
              {revealedAwardTitle.revealedWinner ? (
                <motion.div 
                  key="winner-revealed"
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="bg-slate-900/80 backdrop-blur-xl p-16 rounded-[80px] border-4 border-amber-500/30 shadow-2xl min-w-[60%] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
                  <div className="text-[8vw] font-black text-white uppercase tracking-tighter leading-none mb-4 relative z-10">{revealedAwardTitle.teamName || '---'}</div>
                  <div className="text-[4vw] font-mono font-black text-amber-400 relative z-10">TEAM #{revealedAwardTitle.teamNumber || '0000'}</div>
                </motion.div>
              ) : (
                <motion.div key="winner-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[20vh] flex items-center justify-center">
                  <div className="text-slate-800 text-[10vw] font-black uppercase tracking-[0.2em] italic opacity-20">???</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : isCeremonyMode ? (
          <motion.div
            key="ceremony"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[105] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-10 text-center"
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mb-12">
              <Trophy className="w-32 h-32 text-blue-500/50" />
            </motion.div>
            <h1 className="text-[8vw] font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Closing <span className="text-blue-500">Ceremony</span>
            </h1>
            <p className="text-2xl font-black uppercase tracking-[0.5em] text-slate-500 mt-4">Awards Presentation</p>
          </motion.div>
        ) : qualisData.enabled ? (
          <motion.div
            key="qualis"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 p-10"
          >
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
             
             {!currentQualisMatch ? (
               <div className="text-white/20 text-4xl font-black uppercase tracking-widest">MODO QUALIS</div>
             ) : (
               <div className="w-full max-w-7xl flex flex-col items-center gap-12">
                  <div className="flex flex-col items-center mb-4">
                    <div className="bg-blue-600 px-6 py-2 rounded-full text-white font-black text-sm tracking-[0.3em] uppercase mb-4 shadow-xl shadow-blue-500/20">
                      QUALIFYING MATCH #{qualisData.currentIndex + 1}
                    </div>
                    <h2 className="text-white/40 text-2xl font-black uppercase tracking-tighter">ENFRENTAMIENTO</h2>
                  </div>

                  <div className="flex items-center justify-center gap-16 w-full">
                    {/* Team 1 */}
                    <div className="flex-1 flex flex-col items-end text-right gap-6">
                      <div className={`p-8 rounded-[40px] border-4 transition-all duration-700 w-full ${
                        currentQualisMatch.winner === currentQualisMatch.team1 
                        ? 'bg-green-600 border-green-400 shadow-[0_0_80px_rgba(34,197,94,0.3)] scale-105' 
                        : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="text-white/40 text-sm font-black uppercase mb-2 tracking-widest">TEAM 1</div>
                        <div className="text-5xl md:text-7xl font-black text-white truncate">{currentQualisMatch.team1}</div>
                      </div>
                      {currentQualisMatch.winner === currentQualisMatch.team1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-green-400 font-black text-2xl">
                          <Trophy size={32} /> GANADOR
                        </motion.div>
                      )}
                    </div>

                    <div className="text-6xl font-black text-blue-500 italic px-4">VS</div>

                    {/* Team 2 */}
                    <div className="flex-1 flex flex-col items-start text-left gap-6">
                      <div className={`p-8 rounded-[40px] border-4 transition-all duration-700 w-full ${
                        currentQualisMatch.winner === currentQualisMatch.team2 
                        ? 'bg-green-600 border-green-400 shadow-[0_0_80px_rgba(34,197,94,0.3)] scale-105' 
                        : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="text-white/40 text-sm font-black uppercase mb-2 tracking-widest">TEAM 2</div>
                        <div className="text-5xl md:text-7xl font-black text-white truncate">{currentQualisMatch.team2}</div>
                      </div>
                      {currentQualisMatch.winner === currentQualisMatch.team2 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-green-400 font-black text-2xl">
                          GANADOR <Trophy size={32} />
                        </motion.div>
                      )}
                    </div>
                  </div>
               </div>
             )}
          </motion.div>
        ) : winner ? (
          <motion.div 
            key="winner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 p-10 text-center"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 12 }} className={`w-40 h-40 rounded-[48px] flex items-center justify-center mb-10 border-b-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${winner.alliance === 'A' ? 'bg-blue-600 border-blue-800' : 'bg-red-600 border-red-800'}`}>
              <Trophy className="text-yellow-400 w-20 h-20 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </motion.div>
            <h1 className={`text-[12vw] font-black uppercase tracking-tighter leading-none mb-10 ${winner.alliance === 'A' ? 'text-blue-500' : 'text-red-500'} drop-shadow-[0_0_60px_currentColor]`}>
              Alliance {winner.alliance === 'A' ? 'Alpha' : 'Bravo'}
            </h1>
            <div className="flex gap-16 items-center justify-center bg-slate-900/80 backdrop-blur-md p-12 rounded-[60px] border-2 border-slate-800 shadow-2xl">
              <div className="text-left space-y-2">
                <div className="text-[2vw] font-black text-white uppercase tracking-tight">{winner.team1}</div>
                <div className="text-[2vw] font-black text-slate-400 uppercase tracking-tight">{winner.team2}</div>
              </div>
              <div className="w-1 h-24 bg-slate-800 rounded-full" />
              <div className="text-center">
                <div className="text-[8vw] font-black font-mono leading-none text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">{winner.score}</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
            <header className="relative z-10 flex justify-between items-end border-b-2 border-slate-800/50 pb-6 mb-4">
              <div className="flex items-center gap-8">
                <div className="bg-blue-600 px-6 py-2 rounded-lg skew-x-[-12deg]"><span className="text-3xl font-black italic block skew-x-[12deg]">FLL</span></div>
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter text-white/90">Championship <span className="text-blue-500">2026</span></h1>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                    Live Digital Feed {selectedField && <span onClick={() => setSelectedField(null)} className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded cursor-pointer">• {selectedField.replace('cancha', 'CANCHA ')}</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white uppercase tracking-tight">{activeMatch ? `Match #${activeMatch.position} • Round ${activeMatch.round}` : 'Arena Standby'}</div>
              </div>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
              <motion.div animate={isCritical ? { scale: [1, 1.03, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}>
                <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-[60px] border border-slate-700/50">
                  <div className="bg-slate-950 px-16 py-10 lg:px-24 lg:py-14 rounded-[50px] border-2 border-slate-800 text-center">
                    <AnimatePresence mode="wait">
                      <motion.div key={timer.timeRemaining} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`text-[25vh] leading-[0.8] font-black tabular-nums tracking-tighter ${timer.timeRemaining <= 10 ? 'text-red-500' : timer.timeRemaining <= 30 ? 'text-amber-400' : 'text-white'}`}>
                        {formatTime(timer.timeRemaining)}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </main>

            <footer className="relative z-10 grid grid-cols-2 gap-8 h-[22vh]">
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border-l-8 border-blue-600 p-6 flex justify-between items-center shadow-2xl">
                <div className="space-y-1">
                  <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Alliance Alpha</div>
                  <div className="text-2xl font-black text-white uppercase truncate max-w-[250px]">{activeMatch?.teamA1 || 'TBD'}</div>
                  <div className="text-xl font-bold text-slate-500 uppercase truncate max-w-[250px]">{activeMatch?.teamA2 || 'TBD'}</div>
                </div>
                <div className="text-blue-400 font-mono text-7xl font-black tabular-nums">{activeMatch?.scoreA || 0}</div>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border-r-8 border-red-600 p-6 flex justify-between items-center shadow-2xl">
                <div className="text-red-400 font-mono text-7xl font-black tabular-nums order-2">{activeMatch?.scoreB || 0}</div>
                <div className="space-y-1 order-1">
                  <div className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">Alliance Bravo</div>
                  <div className="text-2xl font-black text-white uppercase truncate max-w-[250px]">{activeMatch?.teamB1 || 'TBD'}</div>
                  <div className="text-xl font-bold text-slate-500 uppercase truncate max-w-[250px]">{activeMatch?.teamB2 || 'TBD'}</div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
