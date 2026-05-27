'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
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

export default function BracketDisplay() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(0.8);

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

    matches.forEach((m) => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });

    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map((r) => ({
        number: r,
        matches: grouped[r].sort((a, b) => a.position - b.position),
      }));
  }, [matches]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050816]">
        <div className="text-2xl font-black uppercase tracking-[0.3em] text-[#66B4B2] animate-pulse">
          Loading Brackets...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-8 flex flex-col items-center overflow-hidden relative bg-gradient-to-br from-[#070B1A] via-[#0E1530] to-[#050816]">
      
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-250px] right-[-150px] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-8 right-8 z-[200] flex gap-2">
        <button
          onClick={() => setZoom((prev) => Math.max(0.2, prev - 0.1))}
          className="p-3 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl text-white hover:bg-[#66B4B2] hover:scale-105 transition-all shadow-2xl"
        >
          <ZoomOut size={20} />
        </button>

        <button
          onClick={() => setZoom(0.8)}
          className="p-3 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl text-white hover:bg-[#66B4B2] hover:scale-105 transition-all shadow-2xl"
        >
          <Maximize size={20} />
        </button>

        <button
          onClick={() => setZoom((prev) => Math.min(1.5, prev + 0.1))}
          className="p-3 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl text-white hover:bg-[#66B4B2] hover:scale-105 transition-all shadow-2xl"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 mb-12 relative z-10"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl bg-[#66B4B2]"
          style={{
            boxShadow: '0 0 40px rgba(102,180,178,0.5)',
          }}
        >
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
            Playoff <span className="text-[#66B4B2]">Brackets</span>
          </h2>

          <p className="text-[#9FB6D9] text-sm font-bold uppercase tracking-[0.3em] mt-2">
            Road to the Championship
          </p>
        </div>
      </motion.div>

      {/* Brackets */}
      <div className="flex-1 w-full overflow-auto custom-scrollbar flex items-start justify-center relative z-10">
        <motion.div
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="flex gap-16 items-start min-w-max px-24 py-24 origin-top"
        >
          {rounds.map((round) => (
            <div
              key={round.number}
              className="flex flex-col gap-12 relative"
            >
              <div className="text-center mb-8">
                <span className="px-8 py-3 rounded-full text-white font-black text-sm tracking-[0.3em] uppercase bg-white/10 backdrop-blur-xl border border-[#66B4B2]/40 shadow-2xl">
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: content-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 180, 178, 0.6);
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
}

function BracketMatch({ match }: { match: Match }) {
  const isFinished = match.status === 'finished';

  const winner = isFinished
    ? match.scoreA > match.scoreB
      ? 'A'
      : 'B'
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      className={`w-72 rounded-3xl overflow-hidden border backdrop-blur-2xl transition-all duration-500 bg-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${
        match.status === 'in_progress'
          ? 'border-[#66B4B2] shadow-[0_0_60px_rgba(102,180,178,0.45)] scale-105 z-10 bg-[#66B4B2]/10'
          : 'border-white/10'
      }`}
    >
      {/* Alliance A */}
      <div
        className={`p-4 flex items-center justify-between border-b border-white/10 ${
          winner === 'A' ? 'bg-[#5AA057]/20' : ''
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-1.5 h-8 bg-blue-500 rounded-full shrink-0 shadow-lg shadow-blue-500/50" />

          <div className="flex flex-col min-w-0">
            <span
              className={`text-[21px] font-black uppercase truncate ${
                winner === 'A' ? 'text-white' : 'text-white/80'
              }`}
            >
              {match.teamA1 || 'TBD'}
            </span>

            {match.teamA2 && (
              <span
                className={`text-[21px] font-bold uppercase truncate ${
                  winner === 'A'
                    ? 'text-white/90'
                    : 'text-white/60'
                }`}
              >
                {match.teamA2}
              </span>
            )}
          </div>
        </div>

        <div
          className={`text-2xl font-black font-mono ml-4 ${
            winner === 'A'
              ? 'text-[#66B4B2]'
              : 'text-[#9FB6D9]'
          }`}
        >
          {isFinished ? match.scoreA : '—'}
        </div>
      </div>

      {/* Alliance B */}
      <div
        className={`p-4 flex items-center justify-between ${
          winner === 'B' ? 'bg-[#5AA057]/20' : ''
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-1.5 h-8 bg-red-500 rounded-full shrink-0 shadow-lg shadow-red-500/50" />

          <div className="flex flex-col min-w-0">
            <span
              className={`text-[21px] font-black uppercase truncate ${
                winner === 'B' ? 'text-white' : 'text-white/80'
              }`}
            >
              {match.teamB1 || 'TBD'}
            </span>

            {match.teamB2 && (
              <span
                className={`text-[21px] font-bold uppercase truncate ${
                  winner === 'B'
                    ? 'text-white/90'
                    : 'text-white/60'
                }`}
              >
                {match.teamB2}
              </span>
            )}
          </div>
        </div>

        <div
          className={`text-2xl font-black font-mono ml-4 ${
            winner === 'B'
              ? 'text-[#66B4B2]'
              : 'text-[#9FB6D9]'
          }`}
        >
          {isFinished ? match.scoreB : '—'}
        </div>
      </div>

      {match.status === 'in_progress' && (
        <div className="bg-[#66B4B2] py-2 text-center shadow-[0_0_30px_rgba(102,180,178,0.6)]">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white animate-pulse">
            Match In Progress
          </span>
        </div>
      )}
    </motion.div>
  );
}