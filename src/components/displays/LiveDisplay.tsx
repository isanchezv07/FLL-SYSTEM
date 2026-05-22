'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '@/lib/socket';
import confetti from 'canvas-confetti';
import { Trophy, Megaphone, Shield, Settings, X } from 'lucide-react';

// ─── OBS Chroma-key background modes ────────────────────────────────────────
type ChromaMode = 'transparent' | 'green' | 'magenta' | 'none';

const CHROMA_STYLES: Record<ChromaMode, React.CSSProperties> = {
  none:        { background: '#481F73' },
  transparent: { background: 'transparent' },
  green:       { background: '#00ff00' },
  magenta:     { background: '#ff00ff' },
};

const CHROMA_HIDES_BLOBS = new Set<ChromaMode>(['green', 'magenta']);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── OS-style Settings Window ────────────────────────────────────────────────
function SettingsWindow({
  mode,
  onChange,
  onClose,
}: {
  mode: ChromaMode;
  onChange: (m: ChromaMode) => void;
  onClose: () => void;
}) {
  const options: { value: ChromaMode; label: string; description: string; preview: React.ReactNode }[] = [
    {
      value: 'none',
      label: 'None',
      description: 'Solid dark background',
      preview: <div className="w-full h-full rounded border border-slate-700" style={{ background: '#481F73' }} />,
    },
    {
      value: 'transparent',
      label: 'Transparent',
      description: 'True alpha — use Browser Source',
      preview: (
        <div className="w-full h-full rounded border border-slate-600 overflow-hidden" style={{
          backgroundImage: 'linear-gradient(45deg, #555 25%, transparent 25%), linear-gradient(-45deg, #555 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #555 75%), linear-gradient(-45deg, transparent 75%, #555 75%)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          backgroundColor: '#333',
        }} />
      ),
    },
    {
      value: 'green',
      label: 'Green Key',
      description: 'Chroma key — #00FF00',
      preview: <div className="w-full h-full rounded" style={{ background: '#00ff00' }} />,
    },
    {
      value: 'magenta',
      label: 'Magenta Key',
      description: 'Chroma key — #FF00FF',
      preview: <div className="w-full h-full rounded" style={{ background: '#ff00ff' }} />,
    },
  ];

  const content = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      {/* backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />

      {/* window */}
      <div
        style={{ position: 'relative', width: 420, background: '#481F73', border: '1px solid #6A86AE', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* title bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#3A2E9C', borderBottom: '1px solid #6A86AE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings style={{ width: 16, height: 16, color: '#94a3b8' }} />
            <span style={{ fontSize: 12, fontWeight: 900, color: '#FEFDFD', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Overlay Settings</span>
          </div>
          <button
            onClick={onClose}
            style={{ width: 24, height: 24, borderRadius: '50%', background: '#6A86AE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X style={{ width: 12, height: 12, color: '#FEFDFD' }} />
          </button>
        </div>

        {/* content */}
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#6A86AE', marginBottom: 16 }}>Background Mode</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 8, padding: 12,
                  borderRadius: 12, border: `1px solid ${mode === opt.value ? '#66B4B2' : '#6A86AE'}`,
                  background: mode === opt.value ? 'rgba(102,180,178,0.15)' : 'rgba(58,46,156,0.4)',
                  cursor: 'pointer', textAlign: 'left',
                  outline: mode === opt.value ? '1px solid rgba(102,180,178,0.5)' : 'none',
                }}
              >
                <div style={{ height: 48, width: '100%' }}>{opt.preview}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: mode === opt.value ? '#66B4B2' : '#FEFDFD' }}>{opt.label}</div>
                  <div style={{ fontSize: 10, color: '#6A86AE', marginTop: 2 }}>{opt.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ─── Main Component ──────────────────────────────────────────────────────────
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

  // ── OBS chroma state ─────────────────────────────────────────────────────
  const [chromaMode, setChromaMode] = useState<ChromaMode>('none');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wake = () => {
      setShowControls(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => setShowControls(false), 2500);
    };
    window.addEventListener('mousemove', wake);
    window.addEventListener('mousedown', wake);
    return () => {
      window.removeEventListener('mousemove', wake);
      window.removeEventListener('mousedown', wake);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('chromaMode') as ChromaMode | null;
    if (saved && saved in CHROMA_STYLES) setChromaMode(saved);

    const savedField = localStorage.getItem('selectedField');
    if (savedField) {
      setSelectedField(savedField);
      selectedFieldRef.current = savedField;
    }
    victoryAudio.current = new Audio('/sounds/end_match(7).wav');
    awardRevealAudio.current = new Audio('/sounds/start_bell(5).wav');
  }, []);

  const handleChromaChange = useCallback((m: ChromaMode) => {
    setChromaMode(m);
    localStorage.setItem('chromaMode', m);
  }, []);

  const handleSettingsToggle = useCallback(() => setSettingsOpen((v) => !v), []);

  // OBS Browser Source requires html/body to also be transparent
  useEffect(() => {
    const t = chromaMode === 'transparent';
    document.documentElement.style.background = t ? 'transparent' : '';
    document.body.style.background = t ? 'transparent' : '';
    return () => { document.documentElement.style.background = ''; document.body.style.background = ''; };
  }, [chromaMode]);

  // ── Existing refs ─────────────────────────────────────────────────────────
  const victoryAudio = useRef<HTMLAudioElement | null>(null);
  const awardRevealAudio = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeMatchRef = useRef<any>(null);
  const selectedFieldRef = useRef<string | null>(null);
  const timerFieldsRef = useRef<Record<string, string | null>>({});
  const lastRevealedAwardId = useRef<string | null>(null);
  const qualisDataRef = useRef<any>({ matches: [], currentIndex: -1, enabled: false });

  const lastFetchTime = useRef<number>(0);

  const fetchActiveMatch = useCallback(async () => {
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

  const triggerQualisConfetti = useCallback(() => {
    confetti.reset();
    const end = Date.now() + 3 * 1000;
    const colors = ['#FFD700', '#FFA500', '#FACC15', '#FFFFFF'];
    (function frame() {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
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

    socket.on('matchUpdate', (updatedMatch: any) => {
      if (activeMatchRef.current?.id === updatedMatch.id) {
        setActiveMatch((prev: any) => {
          const newState = { ...prev, ...updatedMatch };
          activeMatchRef.current = newState;
          return newState;
        });
      }
    });

    socket.on('matchWinnerDeclared', (data: WinnerInfo) => {
      const currentActive = activeMatchRef.current;
      if (currentActive?.teamA1 === data.team1 || currentActive?.teamB1 === data.team1) {
        confetti.reset();
        setWinner(data);
        setNextMatchCountdown(10);

        victoryAudio.current?.play().catch(() => {});
        const end = Date.now() + 5 * 1000;
        const colors = ['#FFD700', '#FFA500', '#FACC15', '#FFFFFF'];
        (function frame() {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());

        const interval = setInterval(() => {
          setNextMatchCountdown((prev) => {
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

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

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
      socket.off('qualisUpdate');
      socket.off('matchUpdate');
      socket.off('matchWinnerDeclared');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [fetchActiveMatch, fetchQualis, triggerQualisConfetti]);

  useEffect(() => {
    const revealedAward = awardsData?.awards?.find((a: any) => a.revealedWinner);

    if (revealedAward && revealedAward.id !== lastRevealedAwardId.current) {
      lastRevealedAwardId.current = revealedAward.id;

      awardRevealAudio.current?.play().catch(() => {});

      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const prizeColors = ['#FFD700', '#D4AF37', '#FDF5E6', '#C0C0C0', '#FFFFFF'];
      const confettiDefaults = { startVelocity: 45, spread: 90, ticks: 200, zIndex: 200, colors: prizeColors, gravity: 0.7, scalar: 1.2, particleCount: 45 };

      const interval: any = setInterval(() => {
        if (Date.now() >= animationEnd) return clearInterval(interval);
        confetti({ ...confettiDefaults, angle: 65, origin: { x: -0.1, y: 0.7 } });
        confetti({ ...confettiDefaults, angle: 115, origin: { x: 1.1, y: 0.7 } });
      }, 200);

      return () => clearInterval(interval);
    } else if (!revealedAward) {
      lastRevealedAwardId.current = null;
    }
  }, [awardsData?.awards]);

  const revealedAwardTitle = awardsData?.awards?.find((a: any) => a.revealedTitle);
  const activeAnnouncement = awardsData?.announcement?.active ? awardsData.announcement.text : null;
  const isCeremonyMode = awardsData?.ceremonyMode;
  const isCritical = timer.timeRemaining <= 30 && timer.isRunning;
  const hideBlobs = CHROMA_HIDES_BLOBS.has(chromaMode);
  const currentQualisMatch = qualisData.matches[qualisData.currentIndex];

  return (
    <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;0,900;1,700;1,900&display=swap');`}</style>
    <div
      ref={containerRef}
      className="h-screen w-screen text-white relative overflow-hidden flex flex-col selection:bg-none"
      style={{ ...CHROMA_STYLES[chromaMode], fontFamily: "'Roboto', Arial, sans-serif" }}
    >
      {/* ── Field selector overlay ──────────────────────────────────────────── */}
      {!selectedField && !qualisData.enabled && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-10" style={{ background: '#481F73' }}>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-10" style={{ color: '#66B4B2' }}>Seleccionar Cancha</h2>
          <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
            {Array.from({ length: timer.fieldCount || 4 }).map((_, idx) => {
              const f = `cancha${idx + 1}`;
              return (
                <button
                  key={f}
                  onClick={() => handleFieldSelect(f)}
                  className="p-10 rounded-3xl text-2xl font-black uppercase transition-all"
                  style={{ background: '#3A2E9C', border: '2px solid #6A86AE', color: '#FEFDFD' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#66B4B2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#3A2E9C')}
                >
                  {f.replace('cancha', 'Cancha ')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Decorative blobs (hidden for solid chroma modes) ───────────────── */}
      {!hideBlobs && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isCritical ? 'bg-red-600/15' : 'bg-[#3A2E9C]/30'}`} />
          <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] transition-colors duration-1000 ${isCritical ? 'bg-red-900/15' : 'bg-[#66B4B2]/10'}`} />
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeAnnouncement ? (
          <motion.div
            key="announcement"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center backdrop-blur-3xl p-20 text-center"
            style={{ background: 'rgba(58,46,156,0.92)' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '60px 60px' }} />
            <div className="p-8 rounded-[40px] mb-12 shadow-2xl" style={{ background: '#66B4B2', boxShadow: '0 0 60px rgba(102,180,178,0.3)' }}>
              <Megaphone className="w-24 h-24 text-white" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-[0.4em] mb-8" style={{ color: '#66B4B2' }}>Comunicado Oficial</h2>
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
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-10"
            style={{ background: '#481F73' }}
          >
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
             
             {!currentQualisMatch ? (
               <div className="text-white/20 text-4xl font-black uppercase tracking-widest">MODO QUALIS</div>
             ) : (
               <div className="w-full max-w-[90vw] flex flex-col items-center gap-12">
                  <div className="flex flex-col items-center mb-4">
                    <div className="px-8 py-3 rounded-full text-white font-black text-xl tracking-[0.3em] uppercase mb-4 shadow-2xl" style={{ background: '#66B4B2', boxShadow: '0 0 40px rgba(102,180,178,0.4)' }}>
                      QUALIFYING MATCH #{qualisData.currentIndex + 1}
                    </div>
                    <h2 className="text-white/40 text-2xl font-black uppercase tracking-[0.5em]">VS</h2>
                  </div>

                  <div className="flex items-center justify-center gap-12 w-full">
                    {/* Team 1 */}
                    <div className="flex-1 flex flex-col items-end text-right gap-6">
                      <div className={`p-10 rounded-[60px] border-4 transition-all duration-700 w-full relative overflow-hidden ${
                        currentQualisMatch.winner === currentQualisMatch.team1 
                        ? 'scale-105' 
                        : 'bg-white/5 border-white/10'
                      }`} style={currentQualisMatch.winner === currentQualisMatch.team1 ? { background: '#5AA057', borderColor: '#A2C22F', boxShadow: '0 0 100px rgba(90,160,87,0.4)' } : {}}>
                        <div className="flex justify-between items-center mb-6">
                          <div className="bg-white/10 px-4 py-1 rounded-full text-[12px] font-black tracking-widest uppercase">Team 1</div>
                          {currentQualisMatch.country1 && (
                            <div className="text-white/60 text-lg font-black uppercase tracking-widest">{currentQualisMatch.country1}</div>
                          )}
                        </div>
                        <div className="text-3xl font-black mb-2 font-mono" style={{ color: '#66B4B2' }}>#{currentQualisMatch.team1}</div>
                        <div className="text-5xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter">
                          {currentQualisMatch.name1 || currentQualisMatch.team1}
                        </div>
                      </div>
                      {currentQualisMatch.winner === currentQualisMatch.team1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 font-black text-4xl italic" style={{ color: '#5AA057' }}>
                          <Trophy size={48} /> GANADOR
                        </motion.div>
                      )}
                    </div>

                    <div className="text-[120px] font-black italic select-none" style={{ color: 'rgba(106,134,174,0.3)' }}>VS</div>

                    {/* Team 2 */}
                    <div className="flex-1 flex flex-col items-start text-left gap-6">
                      <div className={`p-10 rounded-[60px] border-4 transition-all duration-700 w-full relative overflow-hidden ${
                        currentQualisMatch.winner === currentQualisMatch.team2 
                        ? 'scale-105' 
                        : 'bg-white/5 border-white/10'
                      }`} style={currentQualisMatch.winner === currentQualisMatch.team2 ? { background: '#5AA057', borderColor: '#A2C22F', boxShadow: '0 0 100px rgba(90,160,87,0.4)' } : {}}>
                        <div className="flex justify-between items-center mb-6">
                          {currentQualisMatch.country2 && (
                            <div className="text-white/60 text-lg font-black uppercase tracking-widest">{currentQualisMatch.country2}</div>
                          )}
                          <div className="bg-white/10 px-4 py-1 rounded-full text-[12px] font-black tracking-widest uppercase">Team 2</div>
                        </div>
                        <div className="text-3xl font-black mb-2 font-mono" style={{ color: '#66B4B2' }}>#{currentQualisMatch.team2}</div>
                        <div className="text-5xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter">
                          {currentQualisMatch.name2 || currentQualisMatch.team2}
                        </div>
                      </div>
                      {currentQualisMatch.winner === currentQualisMatch.team2 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 font-black text-4xl italic" style={{ color: '#5AA057' }}>
                          GANADOR <Trophy size={48} />
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
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center p-10 overflow-hidden"
            style={{ background: '#481F73' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6A86AE 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-[120px] rounded-full" style={{ background: 'rgba(102,180,178,0.06)' }} />

            <div className="relative z-10 w-full max-w-[90vw] flex flex-col items-center">
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: '#66B4B2', boxShadow: '0 0 40px rgba(102,180,178,0.4)' }}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-[5vw] font-black uppercase tracking-tighter italic text-white leading-none">
                  Draft de <span style={{ color: '#66B4B2' }}>Alianzas</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-4 gap-6 w-full">
                {alliances.alliances.map((alliance: any, idx: number) => (
                  <motion.div
                    key={alliance.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="backdrop-blur-md rounded-[40px] p-8 flex flex-col items-center shadow-xl relative overflow-hidden group"
                    style={{ background: 'rgba(58,46,156,0.4)', border: '1px solid rgba(106,134,174,0.3)' }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(to right, #66B4B2, #3A2E9C)' }} />
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border shadow-inner" style={{ background: '#481F73', borderColor: 'rgba(106,134,174,0.4)' }}>
                      <span className="text-2xl font-black italic" style={{ color: '#66B4B2' }}>{alliance.id}</span>
                    </div>
                    <div className="space-y-4 w-full">
                      {alliance.teamNames.map((name: string, tIdx: number) => (
                        <div key={tIdx} className="text-center">
                          <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#66B4B2' }}>Equipo {tIdx + 1}</div>
                          <div className="text-xl font-black text-white uppercase tracking-tight leading-tight line-clamp-2">{name}</div>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="text-[10px] font-mono font-bold" style={{ color: '#6A86AE' }}>#{alliance.teams[tIdx]}</div>
                            {alliance.teamCountries?.[tIdx] && (
                              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6A86AE' }}>{alliance.teamCountries[tIdx]}</div>
                            )}
                          </div>
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
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center p-20 text-center"
            style={{ background: '#481F73' }}
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
                    y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                  }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
                  className="absolute w-2 h-2 rounded-full blur-[2px]"
                  style={{ background: '#FDD116' }}
                />
              ))}
            </div>

            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-48 h-48 rounded-[50px] flex items-center justify-center mb-12 border-b-[16px]"
              style={{ background: 'linear-gradient(135deg, #FDD116, #E08022)', borderColor: '#DC933A', boxShadow: '0 0 80px rgba(253,209,22,0.3)' }}
            >
              <Trophy className="w-24 h-24 text-white drop-shadow-lg" />
            </motion.div>

            <h2 className="text-4xl font-black uppercase tracking-[0.5em] mb-4" style={{ color: '#E08022' }}>{revealedAwardTitle.name}</h2>
            <div className="text-[2vw] font-bold uppercase tracking-widest mb-12" style={{ color: '#6A86AE' }}>Award Category</div>

            <AnimatePresence mode="wait">
              {revealedAwardTitle.revealedWinner ? (
                <motion.div
                  key="winner-revealed"
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="backdrop-blur-xl p-16 rounded-[80px] border-4 shadow-2xl min-w-[60%] relative overflow-hidden"
                  style={{ background: 'rgba(58,46,156,0.85)', borderColor: 'rgba(224,128,34,0.4)' }}
                >
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(224,128,34,0.1), transparent)' }} />
                  <div className="text-[8vw] font-black text-white uppercase tracking-tighter leading-none mb-4 relative z-10">{revealedAwardTitle.teamName || '---'}</div>
                  <div className="text-[4vw] font-mono font-black relative z-10" style={{ color: '#E08022' }}>TEAM #{revealedAwardTitle.teamNumber || '0000'}</div>
                </motion.div>
              ) : (
                <motion.div key="winner-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[20vh] flex items-center justify-center">
                  <div className="text-[10vw] font-black uppercase tracking-[0.2em] italic opacity-20" style={{ color: '#3A2E9C' }}>???</div>
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
            className="absolute inset-0 z-[105] flex flex-col items-center justify-center p-10 text-center"
            style={{ background: 'linear-gradient(to bottom, #481F73, #3A2E9C, #481F73)' }}
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mb-12">
              <Trophy className="w-32 h-32" style={{ color: 'rgba(102,180,178,0.5)' }} />
            </motion.div>
            <h1 className="text-[8vw] font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Closing <span style={{ color: '#66B4B2' }}>Ceremony</span>
            </h1>
            <p className="text-2xl font-black uppercase tracking-[0.5em] mt-4" style={{ color: '#6A86AE' }}>Awards Presentation</p>
          </motion.div>
        ) : winner ? (
          <motion.div
            key="winner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-10 text-center"
            style={{ background: '#481F73' }}
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
            <h1 className={`text-[12vw] font-black uppercase tracking-tighter leading-none mb-10 ${winner.alliance === 'A' ? 'text-blue-500' : 'text-red-500'} drop-shadow-[0_0_60px_currentColor]`}>
              Alliance {winner.alliance === 'A' ? 'Alpha' : 'Bravo'}
            </h1>
            <div className="flex gap-16 items-center justify-center backdrop-blur-md p-12 rounded-[60px] border-2 shadow-2xl" style={{ background: 'rgba(58,46,156,0.85)', borderColor: 'rgba(106,134,174,0.3)' }}>
              <div className="text-left space-y-2">
                <div className="text-[2vw] font-black text-white uppercase tracking-tight">{winner.team1}</div>
                <div className="text-[2vw] font-black uppercase tracking-tight" style={{ color: '#6A86AE' }}>{winner.team2}</div>
              </div>
              <div className="w-1 h-24 rounded-full" style={{ background: 'rgba(106,134,174,0.4)' }} />
              <div className="text-center">
                <div className="text-[8vw] font-black font-mono leading-none" style={{ color: '#5AA057', textShadow: '0 0 20px rgba(90,160,87,0.4)' }}>{winner.score}</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">

            {/* ── SCOREBOARD BAR ─────────────────────────────────────────────── */}
            <div className="relative z-10 shrink-0" style={{ background: '#111111', boxShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>

              {/* Main row */}
              <div className="flex flex-row items-stretch" style={{ height: 116 }}>

                {/* Red team names — outer left */}
                <div className="flex-1 flex flex-col justify-center px-6" style={{ borderRight: '1px solid #2a2a2a' }}>
                  <span className="text-white font-semibold truncate" style={{ fontSize: 21 }}>{activeMatch?.teamA1 || 'TBD'}</span>
                  <span className="font-semibold truncate" style={{ fontSize: 17, color: '#e05c6a' }}>{activeMatch?.teamA2 || '—'}</span>
                </div>

                {/* Red score — immediately left of timer */}
                <div className="flex items-center justify-center shrink-0" style={{ background: '#c0392b', width: 140, borderRight: '2px solid #111' }}>
                  <span className="text-white font-bold tabular-nums leading-none" style={{ fontSize: 80 }}>
                    {activeMatch?.scoreA ?? 0}
                  </span>
                </div>

                {/* Timer — white background, black text */}
                <div className="flex flex-col items-center justify-center shrink-0" style={{ background: '#ffffff', width: 210, borderLeft: '2px solid #ddd', borderRight: '2px solid #ddd' }}>
                  <motion.div animate={isCritical ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 0.85 }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={timer.timeRemaining}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-bold tabular-nums leading-none text-center"
                        style={{
                          fontSize: 74,
                          color: timer.timeRemaining <= 10 ? '#dc2626' : timer.timeRemaining <= 30 ? '#ea580c' : '#111111',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {formatTime(timer.timeRemaining)}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Blue score — immediately right of timer */}
                <div className="flex items-center justify-center shrink-0" style={{ background: '#1565c0', width: 140, borderLeft: '2px solid #111' }}>
                  <span className="text-white font-bold tabular-nums leading-none" style={{ fontSize: 80 }}>
                    {activeMatch?.scoreB ?? 0}
                  </span>
                </div>

                {/* Blue team names — outer right */}
                <div className="flex-1 flex flex-col justify-center px-6 items-end" style={{ borderLeft: '1px solid #2a2a2a' }}>
                  <span className="text-white font-semibold truncate" style={{ fontSize: 21 }}>{activeMatch?.teamB1 || 'TBD'}</span>
                  <span className="font-semibold truncate" style={{ fontSize: 17, color: '#60a5fa' }}>{activeMatch?.teamB2 || '—'}</span>
                </div>

              </div>

              {/* Match info subtitle row */}
              <div className="flex items-center justify-between px-4" style={{ height: 24, background: '#0a0a0a', borderTop: '1px solid #1e1e1e' }}>
                <span className="font-semibold uppercase" style={{ fontSize: 10, color: '#c0392b', letterSpacing: '0.2em' }}>Red Alliance</span>
                <span className="font-semibold text-center" style={{ fontSize: 10, color: '#6A86AE', letterSpacing: '0.25em' }}>
                  Open México 2026{activeMatch ? `  ·  Match #${activeMatch.position}  ·  Round ${activeMatch.round}` : '  ·  Arena Standby'}
                  {selectedField && (
                    <span onClick={() => setSelectedField(null)} className="cursor-pointer ml-2" style={{ color: '#3b82f6' }}>
                      · {selectedField.replace('cancha', 'Cancha ')}
                    </span>
                  )}
                </span>
                <span className="font-semibold uppercase" style={{ fontSize: 10, color: '#1565c0', letterSpacing: '0.2em' }}>Blue Alliance</span>
              </div>
            </div>

            {/* ── TRANSPARENT CAMERA FEED AREA ───────────────────────────────── */}
            <div className="flex-1 relative">
              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg z-20"
                >
                  Disconnected
                </motion.div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>

      <AnimatePresence>
        {settingsOpen && (
          <SettingsWindow
            mode={chromaMode}
            onChange={handleChromaChange}
            onClose={handleSettingsToggle}
          />
        )}
      </AnimatePresence>

      <button
        onClick={handleSettingsToggle}
        className="fixed top-4 right-4 z-[600] w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
        style={{ background: '#3A2E9C', border: '1px solid #6A86AE', opacity: showControls || settingsOpen ? 1 : 0, pointerEvents: showControls || settingsOpen ? 'auto' : 'none' }}
        aria-label="OBS overlay settings"
      >
        {settingsOpen
          ? <X className="w-5 h-5" style={{ color: '#66B4B2' }} />
          : <Settings className="w-5 h-5" style={{ color: '#66B4B2' }} />
        }
      </button>
    </>
  );
}