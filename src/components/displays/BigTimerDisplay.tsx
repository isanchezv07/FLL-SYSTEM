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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [winner, setWinner] = useState<WinnerInfo | null>(null);
  const [nextMatchCountdown, setNextMatchCountdown] = useState(10);
  const [awardsData, setAwardsData] = useState<any>({ awards: [], announcement: { text: '', active: false }, ceremonyMode: false });
  
  const victoryAudio = useRef<HTMLAudioElement | null>(null);
  const awardRevealAudio = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load selected field from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedField');
    if (saved) setSelectedField(saved);
  }, []);

  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(fieldId);
    localStorage.setItem('selectedField', fieldId);
  };

  const fetchActiveMatch = useCallback(async () => {
    try {
      if (!selectedField || !timer?.fields?.[selectedField]) {
        const res = await fetch('/api/matches');
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const sorted = list.sort((a: any, b: any) => (a.round ?? 0) - (b.round ?? 0) || (a.position ?? 0) - (b.position ?? 0));
        const picked = sorted.find((m: any) => m?.status === 'in_progress') || sorted.find((m: any) => m?.status === 'pending') || sorted[0] || null;
        setActiveMatch(picked);
        return;
      }

      const matchId = timer.fields[selectedField];
      // Solo pedimos el match si ha cambiado el ID para evitar parpadeos
      if (activeMatch?.id === matchId) return;

      const res = await fetch(`/api/matches/${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveMatch(data);
      }
    } catch { }
  }, [selectedField, timer?.fields, activeMatch?.id]);

  useEffect(() => {
    // Inicializar audio
    victoryAudio.current = new Audio('/sounds/end_match(7).wav');
    awardRevealAudio.current = new Audio('/sounds/start_bell(5).wav');

    socket.on('timerUpdate', (data) => setTimer(data));
    socket.on('alliancesUpdate', (data) => setAlliances(data));
    socket.on('matchesUpdate', fetchActiveMatch);
    socket.on('awardsUpdate', (data) => setAwardsData(data));
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // Nueva escucha para actualizaciones instantáneas de puntos SIN fetch
    socket.on('matchUpdate', (updatedMatch: any) => {
      setActiveMatch(prev => {
        if (prev?.id === updatedMatch.id) {
          // Solo actualizamos si realmente es nuestro partido activo para no parpadear
          return { ...prev, ...updatedMatch };
        }
        return prev;
      });
    });
    
    socket.on('matchWinnerDeclared', (data: WinnerInfo) => {
      // Solo lanzamos victoria si el ganador pertenece al match de nuestra cancha
      setWinner(prev => {
        if (activeMatch?.teamA1 === data.team1 || activeMatch?.teamB1 === data.team1) {
           return data;
        }
        return prev;
      });
      
      setNextMatchCountdown(10);
      
      // ... (mismo código de audio y confeti pero condicionado)
      if (activeMatch?.teamA1 === data.team1 || activeMatch?.teamB1 === data.team1) {
        victoryAudio.current?.play().catch(e => console.log("Audio play blocked"));
        const end = Date.now() + 7 * 1000;
        const colors = data.alliance === 'A' ? ['#2563eb', '#ffffff', '#60a5fa'] : ['#dc2626', '#ffffff', '#f87171'];
        (function frame() {
          confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
          confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
      }

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
    });
    
    fetchActiveMatch();
    socket.emit('getTimer');
    socket.emit('getAwards');

    return () => {
      socket.off('timerUpdate');
      socket.off('matchesUpdate');
      socket.off('matchUpdate');
      socket.off('matchWinnerDeclared');
      socket.off('awardsUpdate');
    };
  }, [fetchActiveMatch, activeMatch?.id, activeMatch?.teamA1, activeMatch?.teamB1]);

  // Efecto para detectar cuando se revela un ganador y lanzar confeti
  useEffect(() => {
    const revealedAward = awardsData?.awards?.find((a: any) => a.revealedWinner);
  
    if (revealedAward) {
      awardRevealAudio.current?.play().catch(() => {});
      
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
  
      // Configuración de lujo: Oros, Platas y Brillos
      const prizeColors = ['#FFD700', '#D4AF37', '#FDF5E6', '#C0C0C0', '#FFFFFF'];
  
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
  
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
  
        // Reducimos un poco la cantidad por ráfaga para ganar fluidez
        // pero mantenemos la intensidad con la frecuencia del intervalo
        const particleCount = 40; 
  
        const defaults = {
          startVelocity: 45, // Un poco más lento para que sea elegante
          spread: 70,        // Más abierto para llenar la pantalla
          ticks: 200,        // Que las partículas duren más tiempo visibles
          zIndex: 200,
          colors: prizeColors,
          gravity: 0.7,      // Menos gravedad = caída más mágica y lenta
          scalar: 1.1,       // Partículas ligeramente más grandes
        };
  
        // LANZAMIENTO IZQUIERDO (Oro y Plata)
        confetti({
          ...defaults,
          particleCount,
          angle: 65,
          origin: { x: -0.1, y: 0.7 }, // Un poco fuera de pantalla para naturalidad
        });
  
        // LANZAMIENTO DERECHO (Oro y Plata)
        confetti({
          ...defaults,
          particleCount,
          angle: 115,
          origin: { x: 1.1, y: 0.7 },
        });
      }, 150); // Ajustado a 150ms para no saturar el CPU y mantener el ritmo
    }
  }, [awardsData?.awards]);

  const revealedAward = awardsData?.awards?.find((a: any) => a.revealedTitle);
  const activeAnnouncement = awardsData?.announcement?.active ? awardsData.announcement.text : null;
  const isCeremonyMode = awardsData?.ceremonyMode;
  const allianceSelection = alliances;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCritical = timer.timeRemaining <= 30 && timer.isRunning;

  return (
    <div ref={containerRef} className="h-screen w-screen bg-[#020617] text-white relative overflow-hidden font-sans flex flex-col p-6 lg:p-10 selection:bg-none">
      
      {/* 🏟️ SELECTOR DE CANCHA (Solo si no hay una seleccionada o para cambiar) */}
      {!selectedField && (
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

      {/* 🌌 FONDO DINÁMICO */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isCritical ? 'bg-red-600/15' : 'bg-blue-600/10'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isCritical ? 'bg-red-900/15' : 'bg-indigo-600/10'}`} />
      </div>

      <AnimatePresence mode="wait">
        {activeAnnouncement ? (
          /* 📢 PANTALLA DE ANUNCIO 📢 */
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
        ) : allianceSelection?.active ? (
          /* 🛡️ PANTALLA DE SELECCIÓN DE ALIANZAS 🛡️ */
          <motion.div
            key="alliance-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-[#020617] p-10 overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/5 blur-[120px] rounded-full" />

            <div className="relative z-10 w-full max-w-[90vw] flex flex-col items-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-6 mb-12"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-[5vw] font-black uppercase tracking-tighter italic text-white leading-none">
                  Draft de <span className="text-blue-500">Alianzas</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-4 gap-6 w-full">
                {allianceSelection.alliances.map((alliance: any, idx: number) => (
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
                          <div className="text-xl font-black text-white uppercase tracking-tight leading-tight line-clamp-2">
                            {name}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-slate-500 mt-1">#{alliance.teams[tIdx]}</div>
                        </div>
                      ))}
                      {alliance.teamNames.length === 0 && (
                        <div className="py-8 text-center text-slate-700 font-black uppercase tracking-widest text-[10px] italic">
                          Esperando Selección...
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : revealedAward ? (
          /* 🏆 PANTALLA DE PREMIO 🏆 */
          <motion.div
            key="award"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-slate-950 p-20 text-center"
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fbbf24 2px, transparent 2px)', backgroundSize: '50px 50px' }} />
            
            {/* Sparkles Effect (Siempre activo si hay un título revelado) */}
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

            <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-amber-500 mb-4">{revealedAward.name}</h2>
            <div className="text-[2vw] font-bold text-slate-500 uppercase tracking-widest mb-12">Award Category</div>

            {/* Revelación Condicional del Ganador */}
            <AnimatePresence mode="wait">
              {revealedAward.revealedWinner ? (
                <motion.div 
                  key="winner-revealed"
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="bg-slate-900/80 backdrop-blur-xl p-16 rounded-[80px] border-4 border-amber-500/30 shadow-2xl min-w-[60%] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
                  <div className="text-[8vw] font-black text-white uppercase tracking-tighter leading-none mb-4 relative z-10">
                    {revealedAward.teamName || '---'}
                  </div>
                  <div className="text-[4vw] font-mono font-black text-amber-400 relative z-10">
                    TEAM #{revealedAward.teamNumber || '0000'}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="winner-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[20vh] flex items-center justify-center"
                >
                  <div className="text-slate-800 text-[10vw] font-black uppercase tracking-[0.2em] italic opacity-20">
                    ???
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : isCeremonyMode ? (
          /* 🎭 PANTALLA DE MODO CEREMONIA 🎭 */
          <motion.div
            key="ceremony"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[105] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-10 text-center"
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-12"
            >
              <Trophy className="w-32 h-32 text-blue-500/50" />
            </motion.div>

            <h1 className="text-[8vw] font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Closing <span className="text-blue-500">Ceremony</span>
            </h1>
            <p className="text-2xl font-black uppercase tracking-[0.5em] text-slate-500 mt-4">
              Awards Presentation
            </p>

            <div className="mt-20 flex gap-4">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping delay-100" />
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping delay-200" />
            </div>
          </motion.div>
        ) : winner ? (
          /* 🎊 PANTALLA DE VICTORIA LEGO STYLE 🎊 */
          <motion.div 
            key="winner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 p-10 text-center"
          >
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
          /* 🕹️ PANTALLA NORMAL DEL TIMER */
          <motion.div 
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col"
          >
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
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                    Live Digital Feed 
                    {selectedField && (
                      <span 
                        onClick={() => setSelectedField(null)} 
                        className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        • {selectedField.replace('cancha', 'CANCHA ')}
                      </span>
                    )}
                  </p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
