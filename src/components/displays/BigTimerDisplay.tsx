import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { socket } from '@/lib/socket';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
}

// 1. SOLUCIÓN AL BUG: Movemos este componente AFUERA para que no se re-renderice cada segundo
const LegoStud = () => (
  <div className="w-8 h-8 bg-red-600 rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.3),0_4px_6px_rgba(0,0,0,0.5)] border border-red-800" />
);

export default function LegoTimerDisplay() {
  const [timer, setTimer] = useState<TimerState>({
    timeRemaining: 150,
    isRunning: false
  });
  const [isConnected, setIsConnected] = useState(true);

  // --- TU LÓGICA ORIGINAL INTACTA ---
  useEffect(() => {
    const handleTimerUpdate = (timerData: TimerState) => {
      setTimer(timerData);
    };

    socket.on('timerUpdate', handleTimerUpdate);
    socket.emit('getTimer');

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('getTimer');
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat');
      }
    }, 30000);

    return () => {
      socket.off('timerUpdate', handleTimerUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      clearInterval(heartbeatInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- ESTILOS DE NEÓN ---
  const getTimerColorClass = () =>
    timer.timeRemaining <= 10
      ? 'text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]'
      : timer.timeRemaining <= 30
      ? 'text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]'
      : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]';

  // --- PANTALLA DE DESCONEXIÓN ---
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center bg-red-900/20 p-12 rounded-3xl border-2 border-red-500/50">
          <div className="text-6xl font-black text-red-500 mb-4 tracking-widest">LEGO TIMER</div>
          <div className="text-2xl font-bold text-red-400 animate-pulse">DISCONNECTED</div>
        </div>
      </div>
    );
  }

  // --- RENDER PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      
      {/* Tu fondo original adaptado a modo oscuro */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 p-4">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-blue-500 rounded-sm transform rotate-45"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-lg" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            LEGO TIMER
          </h1>
          <div className="bg-blue-600 text-white px-8 py-3 rounded-full inline-block transform -rotate-2 shadow-xl border-b-4 border-blue-800">
            <span className="text-3xl font-bold tracking-widest">DISPLAY MODE</span>
          </div>
        </motion.div>

        {/* Timer Display (Estructura idéntica a la tuya) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-5xl"
        >
          {/* El marco de la pieza LEGO */}
          <div className="bg-red-600 p-12 rounded-[40px] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.3),inset_5px_5px_15px_rgba(255,255,255,0.2),0_20px_40px_rgba(0,0,0,0.6)] border-b-8 border-r-8 border-red-800 relative">
            
            {/* Studs Superiores */}
            <div className="absolute -top-6 left-10 right-10 flex justify-between">
              {Array.from({ length: 12 }).map((_, i) => (
                <LegoStud key={`top-${i}`} />
              ))}
            </div>
            
            {/* Pantalla Negra Interna */}
            <div className="bg-slate-950 p-10 rounded-[20px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] border-2 border-slate-800 text-center relative overflow-hidden">
              
              {/* Reloj */}
              <div className={`text-[15vw] font-black tabular-nums mb-6 ${getTimerColorClass()}`}
                   style={{ fontFamily: 'Courier New, ui-monospace, monospace' }}>
                {formatTime(timer.timeRemaining)}
              </div>
              
              {/* Indicador de Estado */}
              <div className="flex items-center justify-center gap-4 mb-4 bg-slate-900 inline-flex px-8 py-4 rounded-2xl border border-slate-700">
                <div className={`w-8 h-8 rounded-full shadow-[0_0_15px_currentColor] ${
                  timer.isRunning ? 'bg-green-500 text-green-500 animate-pulse' : 'bg-red-600 text-red-600'
                }`} />
                <span className={`text-4xl font-bold tracking-widest ${timer.isRunning ? 'text-green-400' : 'text-slate-400'}`}>
                  {timer.isRunning ? 'RUNNING' : 'STOPPED'}
                </span>
              </div>
            </div>

            {/* Studs Inferiores */}
            <div className="absolute -bottom-6 left-10 right-10 flex justify-between">
              {Array.from({ length: 12 }).map((_, i) => (
                <LegoStud key={`bottom-${i}`} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}