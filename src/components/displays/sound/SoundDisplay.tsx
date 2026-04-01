import React, { useState, useEffect, useRef } from 'react';
import { socket } from '@/lib/socket';

const SoundDisplay: React.FC = () => {
  const [volume, setVolume] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [displayStatus, setDisplayStatus] = useState<'READY' | 'LIVE'>('READY');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Para el efecto de "suavizado" en la caída de la barra
  const [displayVolume, setDisplayVolume] = useState(0);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      if (volume > displayVolume) {
        setDisplayVolume(volume);
      } else {
        setDisplayVolume(prev => Math.max(0, prev - 1.5)); // Caída suave
      }
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [volume, displayVolume]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 2));
  };

  useEffect(() => {
    const onConnect = () => { setIsConnected(true); addLog("CONECTADO"); };
    const onDisconnect = () => { setIsConnected(false); setVolume(0); addLog("DESCONECTADO"); };
    const onVolumeUpdate = (v: any) => typeof v === 'number' && setVolume(v);
    const onStatusUpdate = (s: 'READY' | 'LIVE') => setDisplayStatus(s);

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

  // Generamos los 40 segmentos del termómetro
  const segments = Array.from({ length: 40 }).reverse();

  return (
    <div className="w-80 bg-[#1a1a1a] p-8 rounded-[2rem] border-[10px] border-[#252525] shadow-2xl flex flex-col items-center gap-6 font-sans select-none">
      
      {/* Cabecera Estilo Rack */}
      <div className="w-full flex justify-between items-end border-b border-white/10 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase">Monitor</span>
          <h2 className="text-2xl font-black text-gray-100 tracking-tighter">VU-METER</h2>
        </div>
        <div className={`h-2 w-2 rounded-full shadow-[0_0_10px] ${isConnected ? 'bg-green-500 shadow-green-500' : 'bg-red-500 animate-pulse shadow-red-500'}`} />
      </div>

      {/* Contenedor del Termómetro */}
      <div className="flex gap-4 h-[400px] items-stretch">
        
        {/* Escala de Números */}
        <div className="flex flex-col justify-between py-1 text-[10px] font-mono text-gray-500 font-bold">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span className="text-blue-500">0</span>
        </div>

        {/* El Cuerpo del Termómetro */}
        <div className="relative w-16 bg-black rounded-lg border-2 border-gray-800 p-1 flex flex-col gap-[2px] shadow-inner">
          {segments.map((_, i) => {
            const segmentValue = (39 - i) * 2.5; // Cada segmento vale 2.5%
            const isActive = displayVolume >= segmentValue;
            
            // Colores por zonas: 0-60 Verde, 60-85 Amarillo, 85+ Rojo
            let colorClass = "bg-gray-900";
            if (isActive) {
              if (segmentValue > 85) colorClass = "bg-red-500 shadow-[0_0_8px_#ef4444]";
              else if (segmentValue > 60) colorClass = "bg-yellow-400 shadow-[0_0_8px_#facc15]";
              else colorClass = "bg-green-500 shadow-[0_0_8px_#22c55e]";
            }

            return (
              <div 
                key={i}
                className={`flex-1 w-full rounded-sm transition-colors duration-150 ${colorClass}`}
              />
            );
          })}
        </div>

        {/* Indicador de Pico (el que se mueve arriba y abajo) */}
        <div className="flex flex-col justify-end">
             <div className="w-1 bg-gray-800 h-full rounded-full overflow-hidden relative">
                <div 
                    className="absolute bottom-0 w-full bg-blue-500 transition-all duration-75"
                    style={{ height: `${volume}%` }}
                />
             </div>
        </div>
      </div>

      {/* Display Digital Inferior */}
      <div className="w-full bg-black/50 rounded-xl p-4 border border-white/5 flex flex-col items-center shadow-inner">
        <div className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mb-1">CURRENT GAIN</div>
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-mono font-black tabular-nums transition-colors ${volume > 90 ? 'text-red-500' : 'text-blue-400'}`}>
            {Math.round(volume).toString().padStart(2, '0')}
          </span>
          <span className="text-blue-900 font-bold text-xl">%</span>
        </div>
      </div>

      {/* Footer con info de conexión */}
      <div className="w-full flex justify-between text-[9px] font-mono text-gray-600">
        <div className="flex gap-2">
            <span className={displayStatus === 'LIVE' ? 'text-yellow-600' : ''}>● {displayStatus}</span>
            <span>|</span>
            <span>{logs[0] || 'IDLE'}</span>
        </div>
        <span className="uppercase">CH_01_INPUT</span>
      </div>

    </div>
  );
};

export default SoundDisplay;