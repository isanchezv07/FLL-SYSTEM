'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { socket } from '@/lib/socket';

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
}

interface BracketDisplayLiveProps {
  /** Zoom level passed in from the parent (e.g. LiveDisplay via SettingsWindow) */
  zoom?: number;
}

export default function BracketDisplayLive({ zoom = 0.8 }: BracketDisplayLiveProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
    } catch (e) {
      console.error('Error fetching matches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    socket.on('matchesUpdate', fetchMatches);
    socket.on('bracketsUpdate', fetchMatches);
    return () => {
      socket.off('matchesUpdate', fetchMatches);
      socket.off('bracketsUpdate', fetchMatches);
    };
  }, []);

  const rounds = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    matches.forEach(m => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map(r => ({
        number: r,
        matches: grouped[r].sort((a, b) => a.position - b.position),
      }));
  }, [matches]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-2xl font-black uppercase tracking-[0.3em] text-[#66B4B2] animate-pulse">
          Loading Brackets...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center overflow-hidden relative">

      {/* ── Purple vignette gradient — ensures text readability over camera ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: [
            /* deep corners */
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(72,31,115,0.72) 0%, transparent 100%)',
            /* top bar behind the title */
            'linear-gradient(to bottom, rgba(58,46,156,0.82) 0%, rgba(58,46,156,0.30) 18%, transparent 36%)',
            /* left + right edge darkening */
            'linear-gradient(to right,  rgba(72,31,115,0.50) 0%, transparent 18%, transparent 82%, rgba(72,31,115,0.50) 100%)',
          ].join(', '),
        }}
      />

      {/* ── Title ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-6 pt-8 pb-6 px-8"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl bg-[#66B4B2]"
          style={{ boxShadow: '0 0 40px rgba(102,180,178,0.4)' }}
        >
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Playoff <span className="text-[#66B4B2]">Brackets</span>
          </h2>
          <p className="text-[#6A86AE] text-xs font-bold uppercase tracking-[0.3em] mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Road to the Championship
          </p>
        </div>
      </motion.div>

      {/* ── Bracket canvas ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 w-full overflow-auto bracket-scrollbar flex items-start justify-center">
        <motion.div
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="flex gap-16 items-start min-w-max px-24 py-12 origin-top"
        >
          {rounds.map((round) => (
            <div key={round.number} className="flex flex-col gap-12 relative">
              <div className="text-center mb-4">
                <span
                  className="px-6 py-2 rounded-full text-white font-black text-sm tracking-[0.3em] uppercase shadow-lg"
                  style={{
                    background: 'rgba(58,46,156,0.75)',
                    border: '2px solid #66B4B2',
                    backdropFilter: 'blur(8px)',
                    textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                  }}
                >
                  Round {round.number}
                </span>
              </div>
              <div className="flex flex-col justify-around gap-12 h-full">
                {round.matches.map((match) => (
                  <BracketMatch key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .bracket-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .bracket-scrollbar::-webkit-scrollbar-track { background: rgba(58,46,156,0.1); border-radius: 10px; }
        .bracket-scrollbar::-webkit-scrollbar-thumb { background: rgba(106,134,174,0.3); border-radius: 10px; }
        .bracket-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(102,180,178,0.5); }
      `}</style>
    </div>
  );
}

// ─── Individual match card ────────────────────────────────────────────────────
function BracketMatch({ match }: { match: Match }) {
  const isFinished = match.status === 'finished';
  const winner = isFinished ? (match.scoreA > match.scoreB ? 'A' : 'B') : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-72 rounded-3xl overflow-hidden border-2 transition-all duration-500 backdrop-blur-md ${
        match.status === 'in_progress'
          ? 'border-[#66B4B2] scale-105 z-10'
          : 'border-[#6A86AE]/30 shadow-xl'
      }`}
      style={{
        /* Slightly more opaque than original so text pops over camera */
        background: 'rgba(30,22,90,0.72)',
        boxShadow: match.status === 'in_progress'
          ? '0 0 30px rgba(102,180,178,0.25), 0 8px 32px rgba(0,0,0,0.6)'
          : '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Alliance A */}
      <div className={`p-4 flex items-center justify-between border-b border-[#6A86AE]/20 ${winner === 'A' ? 'bg-[#5AA057]/25' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-1.5 h-8 bg-blue-500 rounded-full shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className={`text-[11px] font-black uppercase truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] ${winner === 'A' ? 'text-white' : 'text-white/70'}`}>
              {match.teamA1 || 'TBD'}
            </span>
            {match.teamA2 && (
              <span className={`text-[9px] font-bold uppercase truncate ${winner === 'A' ? 'text-white/80' : 'text-white/40'}`}>
                {match.teamA2}
              </span>
            )}
          </div>
        </div>
        <div className={`text-xl font-black font-mono ml-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] ${winner === 'A' ? 'text-[#66B4B2]' : 'text-[#6A86AE]'}`}>
          {isFinished ? match.scoreA : '—'}
        </div>
      </div>

      {/* Alliance B */}
      <div className={`p-4 flex items-center justify-between ${winner === 'B' ? 'bg-[#5AA057]/25' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-1.5 h-8 bg-red-500 rounded-full shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className={`text-[11px] font-black uppercase truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] ${winner === 'B' ? 'text-white' : 'text-white/70'}`}>
              {match.teamB1 || 'TBD'}
            </span>
            {match.teamB2 && (
              <span className={`text-[9px] font-bold uppercase truncate ${winner === 'B' ? 'text-white/80' : 'text-white/40'}`}>
                {match.teamB2}
              </span>
            )}
          </div>
        </div>
        <div className={`text-xl font-black font-mono ml-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] ${winner === 'B' ? 'text-[#66B4B2]' : 'text-[#6A86AE]'}`}>
          {isFinished ? match.scoreB : '—'}
        </div>
      </div>

      {match.status === 'in_progress' && (
        <div className="bg-[#66B4B2] py-1 text-center">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white animate-pulse">
            Match In Progress
          </span>
        </div>
      )}
    </motion.div>
  );
}