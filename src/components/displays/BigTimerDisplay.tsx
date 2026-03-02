import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { socket } from '@/lib/socket';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
}

export default function LegoTimerDisplay() {
  const [timer, setTimer] = useState<TimerState>({
    timeRemaining: 150,
    isRunning: false
  });
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Listen for timer updates from server
    const handleTimerUpdate = (timerData: TimerState) => {
      console.log('BigTimerDisplay: Received timerUpdate:', timerData);
      setTimer(timerData);
    };

    socket.on('timerUpdate', handleTimerUpdate);
    
    // Request initial timer state
    socket.emit('getTimer');

    // Handle connection status
    const handleConnect = () => {
      console.log('BigTimerDisplay: Connected to server');
      setIsConnected(true);
      socket.emit('getTimer'); // Sync state on reconnect
    };
    
    const handleDisconnect = () => {
      console.log('BigTimerDisplay: Disconnected from server');
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    
    // Add heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds

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

  const getTimerColorClass = () =>
    timer.timeRemaining <= 10
      ? 'text-red-600'
      : timer.timeRemaining <= 30
      ? 'text-yellow-500'
      : 'text-gray-800';

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-black text-red-800 mb-4">LEGO TIMER</div>
          <div className="text-2xl font-bold text-red-600 animate-pulse">DISCONNECTED</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-yellow-100 relative overflow-hidden">
      {/* LEGO Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 p-4">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-red-600 rounded-sm transform rotate-45"
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* LEGO Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-8xl font-black text-red-800 mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            LEGO TIMER
          </h1>
          <div className="bg-yellow-400 text-red-800 px-8 py-3 rounded-full inline-block transform -rotate-2 shadow-lg">
            <span className="text-3xl font-bold">DISPLAY MODE</span>
          </div>
        </motion.div>

        {/* Timer Display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* LEGO Frame */}
          <div className="bg-white p-12 rounded-3xl shadow-2xl border-8 border-red-600 relative">
            {/* LEGO Studs */}
            <div className="absolute -top-6 left-6 right-6 flex justify-between">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-red-600 rounded-full shadow-md"
                />
              ))}
            </div>
            
            {/* Timer Display */}
            <div className="text-center">
              <div className={`text-[15vw] font-black tabular-nums mb-6 ${getTimerColorClass()}`}
                   style={{ fontFamily: 'Courier New, monospace' }}>
                {formatTime(timer.timeRemaining)}
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`w-8 h-8 rounded-full ${
                  timer.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-3xl font-bold text-gray-700">
                  {timer.isRunning ? 'RUNNING' : 'STOPPED'}
                </span>
              </div>
            </div>

            {/* Bottom LEGO Studs */}
            <div className="absolute -bottom-6 left-6 right-6 flex justify-between">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-red-600 rounded-full shadow-md"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}