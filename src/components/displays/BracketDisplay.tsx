'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shield, Users, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
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
    <div className="h-full w-full p-8 flex flex-col items-center overflow-hidden relative">
      {/* Zoom Controls */}
      <div className="absolute top-8 right-8 z-[200] flex gap-2">
        <button 
          onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))}
          className="p-3 bg-[#3A2E9C] border border-[#6A86AE]/30 text-white rounded-xl hover:bg-[#66B4B2] transition-all shadow-xl"
        >
          <ZoomOut size={20} />
        </button>
        <button 
          onClick={() => setZoom(0.8)}
          className="p-3 bg-[#3A2E9C] border border-[#6A86AE]/30 text-white rounded-xl hover:bg-[#66B4B2] transition-all shadow-xl"
        >
          <Maximize size={20} />
        </button>
        <button 
          onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
          className="p-3 bg-[#3A2E9C] border border-[#6A86AE]/30 text-white rounded-xl hover:bg-[#66B4B2] transition-all shadow-xl"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 mb-12"
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl bg-[#66B4B2]" style={{ boxShadow: '0 0 40px rgba(102,180,178,0.4)' }}>
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
            Playoff <span className="text-[#66B4B2]">Brackets</span>
          </h2>
          <p className="text-[#6A86AE] text-sm font-bold uppercase tracking-[0.3em] mt-2">Road to the Championship</p>
        </div>
      </motion.div>

      <div className="flex-1 w-full overflow-auto custom-scrollbar flex items-start justify-center">
        <motion.div 
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="flex gap-16 items-start min-w-max px-24 py-24 origin-top"
        >
          {rounds.map((round, rIdx) => (
            <div key={round.number} className="flex flex-col gap-12 relative">
              <div className="text-center mb-8">
                <span className="px-8 py-3 rounded-full text-white font-black text-sm tracking-[0.3em] uppercase bg-[#3A2E9C] border-2 border-[#66B4B2] shadow-lg">
                  Round {round.number}
                </span>
              </div>
              
              <div className="flex flex-col justify-around gap-12 h-full">
                {round.matches.map((match, mIdx) => (
                  <BracketMatch key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(58, 46, 156, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(106, 134, 174, 0.3);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 180, 178, 0.5);
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
}

function BracketMatch({ match }: { match: Match }) {
  const isFinished = match.status === 'finished';
  const winner = isFinished ? (match.scoreA > match.scoreB ? 'A' : 'B') : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-72 rounded-3xl overflow-hidden border-2 transition-all duration-500 bg-[#3A2E9C]/40 backdrop-blur-md ${
        match.status === 'in_progress' 
          ? 'border-[#66B4B2] shadow-[0_0_30px_rgba(102,180,178,0.2)] scale-105 z-10' 
          : 'border-[#6A86AE]/30 shadow-xl'
      }`}
    >
      {/* Alliance A */}
      <div className={`p-4 flex items-center justify-between border-b border-[#6A86AE]/20 ${winner === 'A' ? 'bg-[#5AA057]/20' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className={`text-[11px] font-black uppercase truncate ${winner === 'A' ? 'text-white' : 'text-white/60'}`}>
              {match.teamA1 || 'TBD'}
            </span>
            {match.teamA2 && (
              <span className={`text-[9px] font-bold uppercase truncate ${winner === 'A' ? 'text-white/80' : 'text-white/40'}`}>
                {match.teamA2}
              </span>
            )}
          </div>
        </div>
        <div className={`text-xl font-black font-mono ml-4 ${winner === 'A' ? 'text-[#66B4B2]' : 'text-[#6A86AE]'}`}>
          {isFinished ? match.scoreA : '—'}
        </div>
      </div>

      {/* Alliance B */}
      <div className={`p-4 flex items-center justify-between ${winner === 'B' ? 'bg-[#5AA057]/20' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-1.5 h-8 bg-red-600 rounded-full shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className={`text-[11px] font-black uppercase truncate ${winner === 'B' ? 'text-white' : 'text-white/60'}`}>
              {match.teamB1 || 'TBD'}
            </span>
            {match.teamB2 && (
              <span className={`text-[9px] font-bold uppercase truncate ${winner === 'B' ? 'text-white/80' : 'text-white/40'}`}>
                {match.teamB2}
              </span>
            )}
          </div>
        </div>
        <div className={`text-xl font-black font-mono ml-4 ${winner === 'B' ? 'text-[#66B4B2]' : 'text-[#6A86AE]'}`}>
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
