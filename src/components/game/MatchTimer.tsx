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
      // Validamos que el objeto tenga las propiedades necesarias para evitar errores
      if (timerData && typeof timerData.timeRemaining === 'number') {
        setTimer({
          timeRemaining: timerData.timeRemaining,
          isRunning: !!timerData.isRunning
        });
      }
    };

    const requestTimer = () => {
      socket.emit('getTimer');
    };

    socket.on('timerUpdate', handleTimerUpdate);
    socket.on('connect', requestTimer);
    
    // Solicitar inmediatamente
    requestTimer();

    return () => { 
      socket.off('timerUpdate', handleTimerUpdate); 
      socket.off('connect', requestTimer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerStyles = () => {
    if (timer.timeRemaining <= 10 && timer.isRunning) return 'text-[#ED1C24] dark:text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(237,28,36,0.4)]';
    if (timer.isRunning) return 'text-white dark:text-blue-400 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]';
    // Modo standby - Mejoramos visibilidad en White Mode (Header Azul)
    return 'text-white/70 dark:text-slate-500';
  };

  return (
    <div className="flex items-center gap-4 px-5 py-1.5 rounded-xl bg-black/30 dark:bg-black/60 border border-white/10 dark:border-slate-800 transition-all shadow-inner">
      <div className="flex flex-col items-center leading-none">
        <span className="text-[7px] font-black text-blue-200/60 dark:text-slate-500 uppercase tracking-widest mb-0.5 italic">Telemetría Match</span>
        <div className={`font-mono text-2xl font-black tabular-nums tracking-tighter transition-colors ${getTimerStyles()}`}>
          {formatTime(timer.timeRemaining)}
        </div>
      </div>

      <div className="h-8 w-[1px] bg-white/10 dark:bg-slate-800 mx-1" />

      <div className="flex flex-col items-center leading-none">
        <span className="text-[7px] font-black text-blue-200/60 dark:text-slate-500 uppercase tracking-widest mb-1 italic">Status</span>
        <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${
          timer.isRunning 
            ? 'bg-[#28a745] text-white shadow-[0_0_10px_rgba(40,167,69,0.4)]' 
            : 'bg-slate-700/50 text-slate-300 dark:bg-slate-800 dark:text-slate-500 border border-white/5'
        }`}>
          {timer.isRunning ? 'Running' : 'Ready'}
        </div>
      </div>
    </div>
  );
}
