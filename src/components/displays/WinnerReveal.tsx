'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface WinnerInfo {
  alliance: 'A' | 'B';
  team1: string;
  team2?: string;
  score: number;
}

interface WinnerRevealProps {
  winner: WinnerInfo;
  getTeamDisplay: (number: string) => string;
}

export default function WinnerReveal({ winner, getTeamDisplay }: WinnerRevealProps) {
  const isRed = winner.alliance === 'A';
  const allianceName = isRed ? 'Red Alliance' : 'Blue Alliance';
  const primaryColor = isRed ? '#ef4444' : '#3b82f6';
  const secondaryColor = isRed ? '#991b1b' : '#1e40af';
  const glowColor = isRed ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';

  return (
    <motion.div
      key="winner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[150] flex flex-col items-center justify-center p-10 text-center overflow-hidden"
      style={{ 
        background: `radial-gradient(circle at center, ${secondaryColor} 0%, #020617 100%)`,
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Trophy Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.4 }}
          className="w-48 h-48 rounded-[60px] flex items-center justify-center mb-12 relative"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            boxShadow: `0 20px 80px ${glowColor}`,
            borderBottom: '12px solid rgba(0,0,0,0.3)'
          }}
        >
          <Trophy className="text-yellow-400 w-24 h-24 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
          
          {/* Sparkles or extra glow */}
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-[60px] border-4 border-yellow-400/30"
          />
        </motion.div>

        {/* Alliance Name */}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="text-[10vw] font-black uppercase tracking-tighter leading-none mb-4"
          style={{ 
            color: 'white',
            textShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`
          }}
        >
          {allianceName}
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-black uppercase tracking-[0.5em] text-white/40 mb-12"
        >
          Victory
        </motion.div>

        {/* Teams & Score Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, type: 'spring', damping: 15 }}
          className="flex gap-16 items-center justify-center backdrop-blur-xl p-12 rounded-[60px] border-2 shadow-2xl relative overflow-hidden"
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderColor: 'rgba(255, 255, 255, 0.1)' 
          }}
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="text-left space-y-4 relative z-10">
            <div className="text-[2.5vw] font-black text-white uppercase tracking-tight leading-tight">
              {getTeamDisplay(winner.team1)}
            </div>
            {winner.team2 && winner.team2 !== '—' && (
              <div className="text-[2vw] font-black uppercase tracking-tight leading-tight text-white/50">
                {getTeamDisplay(winner.team2)}
              </div>
            )}
          </div>

          <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent relative z-10" />

          <div className="text-center relative z-10">
            <div className="text-[10vw] font-black font-mono leading-none tracking-tighter" style={{ 
              color: '#4ade80',
              textShadow: '0 0 30px rgba(74, 222, 128, 0.5)'
            }}>
              {winner.score}
            </div>
            <div className="text-sm font-black uppercase tracking-[0.3em] text-white/30 mt-2">Points</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Confetti-like particles (CSS only) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 - 50 + '%', 
            y: '120%', 
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: '-20%', 
            rotate: 360,
            x: (Math.random() * 100 - 50) + (Math.sin(i) * 10) + '%'
          }}
          transition={{ 
            duration: 4 + Math.random() * 4, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute w-4 h-4"
          style={{ 
            background: i % 2 === 0 ? primaryColor : '#fbbf24',
            borderRadius: i % 3 === 0 ? '50%' : '2px',
            zIndex: 140
          }}
        />
      ))}
    </motion.div>
  );
}
