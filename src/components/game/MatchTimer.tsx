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
    if (timer.timeRemaining <= 10 && timer.isRunning) return 'text-[#CE1126] drop-shadow-[0_0_12px_rgba(206,17,38,0.4)] animate-pulse';
    if (timer.isRunning) return 'text-[#006847] drop-shadow-[0_0_8px_rgba(0,104,71,0.2)]';
    return 'text-gray-400';
  };

  return (
    <div className="group flex items-center gap-4 bg-white/70 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white shadow-lg shadow-gray-200/50 transition-all hover:border-gray-200">
      <div className="relative">
        <Clock className={`w-5 h-5 transition-colors ${timer.isRunning ? 'text-[#006847]' : 'text-gray-300'}`} />
        {timer.isRunning && (
          <div className="absolute inset-0 bg-[#006847]/10 blur-md rounded-full animate-pulse" />
        )}
      </div>
      
      <div className={`font-mono text-3xl font-black tabular-nums tracking-tighter transition-colors ${getStatusColor()}`}>
        {formatTime(timer.timeRemaining)}
      </div>

      <div className="flex flex-col border-l border-gray-100 pl-4 h-full justify-center">
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Status</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${timer.isRunning ? 'text-[#006847]' : 'text-[#CE1126]'}`}>
          {timer.isRunning ? 'Live' : 'Stop'}
        </span>
      </div>
    </div>
  );
}
