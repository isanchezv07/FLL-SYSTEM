import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { socket } from '@/lib/socket';

export default function HeadLegoTimer() {    
  const [timeRemaining, setTimeRemaining] = useState(150);
  const [isRunning, setIsRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startTimer = () => {
    if (timerInterval) return;
    
    console.log('HeadReferee: Starting local timer');
    setIsRunning(true);
    
    const interval = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          setTimerInterval(null);
          setIsRunning(false);
          socket.emit('updateTimer', { timeRemaining: 0, isRunning: false });
          return 0;
        }
        const newTime = prev - 1;
        socket.emit('updateTimer', { timeRemaining: newTime, isRunning: true });
        return newTime;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setIsRunning(false);
      socket.emit('updateTimer', { timeRemaining, isRunning: false });
    }
  };
  
  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTimeRemaining(150);
    setIsRunning(false);
    socket.emit('updateTimer', { timeRemaining: 150, isRunning: false });
  };

  useEffect(() => {
    // Listen for timer updates from server
    socket.on('timerUpdate', (timerData) => {
      console.log('HeadReferee: Received timerUpdate:', timerData);
      setTimeRemaining(timerData.timeRemaining);
      setIsRunning(timerData.isRunning);
    });

    // Request initial timer state
    socket.emit('getTimer');
    
    return () => {
      socket.off('timerUpdate');
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 relative overflow-hidden">
      {/* LEGO Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 p-4">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-blue-600 rounded-sm transform rotate-45"
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
          <h1 className="text-6xl font-black text-blue-800 mb-2" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            HEAD LEGO TIMER
          </h1>
          <div className="bg-cyan-400 text-blue-800 px-6 py-2 rounded-full inline-block transform -rotate-2 shadow-lg">
            <span className="text-xl font-bold">FTC Scoring System</span>
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
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-8 border-blue-600 relative">
            {/* LEGO Studs */}
            <div className="absolute -top-4 left-4 right-4 flex justify-between">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 bg-blue-600 rounded-full shadow-md"
                />
              ))}
            </div>
            
            {/* Timer Display */}
            <div className="text-center">
              <div className={`text-8xl font-black tabular-nums mb-4 ${
                timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 
                timeRemaining <= 30 ? 'text-yellow-600' : 
                'text-gray-800'
              }`} style={{ fontFamily: 'Courier New, monospace' }}>
                {formatTime(timeRemaining)}
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`w-4 h-4 rounded-full ${
                  isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-lg font-semibold text-gray-700">
                  {isRunning ? 'RUNNING' : 'PAUSED'}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTimer}
                  disabled={isRunning}
                  className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                    isRunning 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Play size={24} />
                    <span>START</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseTimer}
                  disabled={!isRunning}
                  className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                    !isRunning 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Pause size={24} />
                    <span>PAUSE</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw size={24} />
                    <span>RESET</span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Bottom LEGO Studs */}
            <div className="absolute -bottom-4 left-4 right-4 flex justify-between">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 bg-blue-600 rounded-full shadow-md"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
