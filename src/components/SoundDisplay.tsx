import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';

const SoundDisplay: React.FC = () => {
  const [volume, setVolume] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [displayStatus, setDisplayStatus] = useState<'READY' | 'LIVE'>('READY');
  const [logs, setLogs] = useState<string[]>([]);
  
  const lastUpdateRef = useRef<number>(Date.now());

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 3));
    console.log(`[Display] ${msg}`);
  };

  useEffect(() => {
    addLog("Iniciando monitor...");
    
    const onConnect = () => {
      setIsConnected(true);
      addLog("✅ Conectado al servidor");
    };
    
    const onDisconnect = () => {
      setIsConnected(false);
      setVolume(0);
      addLog("❌ Desconectado");
    };

    const onVolumeUpdate = (newVolume: any) => {
      if (typeof newVolume === 'number') {
        setVolume(newVolume);
        lastUpdateRef.current = Date.now();
      }
    };

    const onStatusUpdate = (newStatus: 'READY' | 'LIVE') => {
      setDisplayStatus(newStatus);
      addLog("Status: " + newStatus);
    };

    if (socket.connected) onConnect();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('volume_update', onVolumeUpdate);
    socket.on('display_status_update', onStatusUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('volume_update', onVolumeUpdate);
      socket.off('display_status_update', onStatusUpdate);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl bg-gray-900/95 p-10 rounded-[3rem] border-8 border-gray-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] transition-colors duration-1000 ${displayStatus === 'LIVE' ? 'bg-yellow-500/10' : 'bg-green-500/5'}`}></div>
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex flex-col text-left">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Audio Monitor</h2>
          <span className="text-cyan-500 font-mono text-[10px] tracking-[0.4em] mt-2 uppercase font-black">Real-Time Telemetry</span>
        </div>
        
        <div className={`px-5 py-2 rounded-2xl border-2 transition-all duration-500 ${
          isConnected 
            ? (displayStatus === 'READY' ? 'border-green-500/50 text-green-500' : 'border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]') 
            : 'border-red-600 text-red-600 animate-pulse'
        } font-black text-[11px] flex items-center gap-3 tracking-[0.2em]`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? (displayStatus === 'READY' ? 'bg-green-500' : 'bg-yellow-500 animate-ping') : 'bg-red-600'}`}></div>
          {isConnected ? (displayStatus === 'READY' ? 'READY' : 'LIVE') : 'OFFLINE'}
        </div>
      </div>

      <div className="space-y-12 relative z-10">
        {/* Barra Retro */}
        <div className="relative">
          <div className="h-36 bg-black/80 rounded-3xl p-4 border-4 border-gray-800 shadow-inner flex gap-2 overflow-hidden items-end">
            {[...Array(25)].map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-sm transition-all duration-75 ${
                  (i * 4) < volume 
                    ? (i < 15 ? 'bg-green-500' : i < 21 ? 'bg-yellow-500' : 'bg-red-500') 
                    : 'bg-gray-900'
                }`}
                style={{
                  height: `${20 + (i * 3)}%`,
                  boxShadow: (i * 4) < volume ? '0 0 15px currentColor' : 'none',
                  opacity: (i * 4) < volume ? 1 : 0.2
                }}
              />
            ))}
          </div>
          <div className="absolute -top-3 right-4 bg-red-600 text-white px-3 py-1 text-[9px] font-black italic rounded-lg uppercase tracking-widest shadow-lg">
            Signal Peak
          </div>
        </div>

        {/* Círculo Central */}
        <div className="flex justify-center items-center py-4">
          <div 
            className="relative flex items-center justify-center transition-transform duration-75 ease-out"
            style={{ transform: `scale(${1 + volume/200})` }}
          >
            <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-200 border-[12px] border-white/5 ${volume > 80 ? 'bg-red-600 shadow-red-900/40' : 'bg-cyan-600 shadow-cyan-900/40'}`}>
              <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{Math.round(volume)}</span>
              <span className="text-[11px] font-black text-white/50 tracking-[0.4em] uppercase mt-2">Volume %</span>
            </div>
            {/* Outer Pulse */}
            <div className={`absolute inset-0 rounded-full border-2 transition-all duration-150 ${volume > 50 ? 'border-white/20' : 'border-transparent'}`} style={{ transform: `scale(${1.2 + volume/100})` }}></div>
          </div>
        </div>

        {/* Logs de estado minúsculos para debug */}
        <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
          <div className="text-[8px] text-gray-500 font-black uppercase mb-2 tracking-widest flex justify-between">
            <span>Display Feed Log</span>
            <span className="text-cyan-500">{isConnected ? 'CONNECTED' : 'WAITING'}</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className={`text-[9px] font-mono ${i === 0 ? 'text-gray-300' : 'text-gray-600'}`}>
              {`> ${log}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SoundDisplay;
