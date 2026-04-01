'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { Clock } from 'lucide-react';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
}

export default function MatchTimer() {
  const [timer, setTimer] = useState<TimerState>({
    timeRemaining: 150,
    isRunning: false
  });

  useEffect(() => {
    const handleTimerUpdate = (timerData: TimerState) => {
      setTimer(timerData);
    };
    socket.on('timerUpdate', handleTimerUpdate);
    socket.emit('getTimer');
    return () => { socket.off('timerUpdate', handleTimerUpdate); };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (timer.timeRemaining <= 10 && timer.isRunning) return 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse';
    if (timer.isRunning) return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]';
    return 'text-slate-500';
  };

  return (
    <div className="group flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:border-slate-600">
      <div className="relative">
        <Clock className={`w-5 h-5 ${timer.isRunning ? 'text-blue-400 animate-spin-slow' : 'text-slate-600'}`} />
        {timer.isRunning && (
          <div className="absolute inset-0 bg-blue-400/20 blur-md rounded-full animate-pulse" />
        )}
      </div>
      
      <div className={`font-mono text-3xl font-black tabular-nums tracking-tighter transition-colors ${getStatusColor()}`}>
        {formatTime(timer.timeRemaining)}
      </div>

      <div className="flex flex-col border-l border-slate-700/50 pl-4 h-full justify-center">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Status</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${timer.isRunning ? 'text-emerald-500' : 'text-red-500'}`}>
          {timer.isRunning ? 'Live' : 'Stop'}
        </span>
      </div>
    </div>
  );
}
