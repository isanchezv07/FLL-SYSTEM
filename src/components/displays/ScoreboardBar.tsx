'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Match {
  position?: number;
  round?: number;
  teamA1?: string;
  teamA2?: string;
  teamB1?: string;
  teamB2?: string;
  scoreA?: number;
  scoreB?: number;
}

interface TimerState {
  timeRemaining: number;
}

interface ScoreboardBarProps {
  activeMatch: Match | null;
  timer: TimerState;
  teams: any[];
  layoutPosition: 'top' | 'bottom';
  selectedField: string | null;
  isCritical: boolean;
  onFieldClick?: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function ScoreboardBar({
  activeMatch,
  timer,
  teams,
  layoutPosition,
  selectedField,
  isCritical,
  onFieldClick,
}: ScoreboardBarProps) {
  const getTeamDisplay = (number: any) => {
    if (!number || number === 'TBD' || number === '—') return number || '—';
    const team = teams?.find(t => t.number === number.toString());
    if (!team) return `Team ${number}`;
    return `${team.number} - ${team.name} (${team.country || 'N/A'})`;
  };

  return (
    <div className="relative z-20 shrink-0">
  
      {/* Main row */}
      <div
        className="flex flex-row items-stretch"
        style={{
          height: 116,
          background: '#0f172a',
          boxShadow:
            layoutPosition === 'bottom'
              ? '0 -10px 40px rgba(0,0,0,0.15)'
              : '0 10px 40px rgba(0,0,0,0.15)',
        }}
      >
  
        {/* Red team names — outer left */}
        <div
          className="flex-1 flex flex-col justify-center px-6"
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-white font-semibold truncate" style={{ fontSize: 24 }}>
            {getTeamDisplay(activeMatch?.teamA1)}
          </span>
          <span className="text-white font-semibold truncate" style={{ fontSize: 24 }}>
            {getTeamDisplay(activeMatch?.teamA2)}
          </span>
        </div>
  
        {/* Red score */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            background: '#c0392b',
            width: 140,
            borderRight: '2px solid #0f172a',
          }}
        >
          <span className="text-white font-bold tabular-nums leading-none" style={{ fontSize: 80 }}>
            {activeMatch?.scoreA ?? 0}
          </span>
        </div>
  
        {/* Timer Box */}
        <div
          className="flex flex-col items-center justify-center shrink-0"
          style={{
            background: '#ffffff',
            width: 210,
            borderLeft: '2px solid #0f172a',
            borderRight: '2px solid #0f172a',
          }}
        >
          <motion.div
            animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.85 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={timer.timeRemaining}
                className="font-bold tabular-nums leading-none text-center"
                style={{
                  fontSize: 74,
                  color:
                    timer.timeRemaining <= 10
                      ? '#dc2626'
                      : timer.timeRemaining <= 30
                      ? '#ea580c'
                      : '#0f172a',
                  letterSpacing: '0.02em',
                }}
              >
                {formatTime(timer.timeRemaining)}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
  
        {/* Blue score */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            background: '#1565c0',
            width: 140,
            borderLeft: '2px solid #0f172a',
          }}
        >
          <span className="text-white font-bold tabular-nums leading-none" style={{ fontSize: 80 }}>
            {activeMatch?.scoreB ?? 0}
          </span>
        </div>
  
        {/* Blue team names */}
        <div
          className="flex-1 flex flex-col justify-center px-6 items-end"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-white font-semibold truncate" style={{ fontSize: 24 }}>
            {getTeamDisplay(activeMatch?.teamB1)}
          </span>
          <span className="text-white font-semibold truncate" style={{ fontSize: 24 }}>
            {getTeamDisplay(activeMatch?.teamB2)}
          </span>
        </div>
      </div>
  
      {/* Championship box */}
      <div className="flex justify-center pt-2">
        <div
          className="inline-flex items-center justify-center gap-2 px-4 py-1 rounded-md font-semibold text-center"
          style={{
            fontSize: 10,
            color: '#94a3b8',
            letterSpacing: '0.25em',
            background: '#020617',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span>
            Championship 2026
            {activeMatch
              ? ` · Match #${activeMatch.position} · Round ${activeMatch.round}`
              : ' · Arena Standby'}
          </span>
  
          {selectedField && (
            <span
              onClick={onFieldClick}
              className="cursor-pointer hover:text-white transition-colors"
              style={{ color: '#3b82f6' }}
            >
              · {selectedField.replace('cancha', 'Cancha ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
