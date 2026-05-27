import React, { useState, useEffect, useRef } from 'react';
import { socket } from '@/lib/socket';

const SoundDisplay: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [teamStatus, setTeamStatus] = useState<{blue: boolean, red: boolean}>({blue: false, red: false});
  const [logs, setLogs] = useState<string[]>([]);
  
  // Refs para valores inmediatos del socket (evita re-renders excesivos)
  const targetVolumesRef = useRef({ blue: 0, red: 0 });
  
  // Estados para la UI (animados)
  const [displayVolumes, setDisplayVolumes] = useState({ blue: 0, red: 0 });
  const [peakVolumes, setPeakVolumes] = useState({ blue: 0, red: 0 });
  
  const bluePeakTimeoutRef = useRef<number | null>(null);
  const redPeakTimeoutRef = useRef<number | null>(null);

  // Bucle de animación independiente del socket
  useEffect(() => {
    let animationFrame: number;
    
    const update = () => {
      setDisplayVolumes(prev => {
        // Suavizado de caída, pero subida instantánea
        const nextBlue = targetVolumesRef.current.blue > prev.blue 
          ? targetVolumesRef.current.blue 
          : Math.max(0, prev.blue - 1.5);
          
        const nextRed = targetVolumesRef.current.red > prev.red 
          ? targetVolumesRef.current.red 
          : Math.max(0, prev.red - 1.5);
          
        return { blue: nextBlue, red: nextRed };
      });

      setPeakVolumes(prev => {
        // Mantiene el máximo histórico estático
        return {
          blue: Math.max(prev.blue, targetVolumesRef.current.blue),
          red: Math.max(prev.red, targetVolumesRef.current.red)
        };
      });

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 3));
  };

  const resetPeaks = () => {
    console.log("[SoundDisplay] Resetting all peaks and volumes");
    targetVolumesRef.current = { blue: 0, red: 0 };
    setPeakVolumes({ blue: 0, red: 0 });
    setDisplayVolumes({ blue: 0, red: 0 });
    addLog("PEAKS RESET");
  };

  useEffect(() => {
    const onConnect = () => { setIsConnected(true); addLog("CONECTADO"); };
    const onDisconnect = () => { 
      setIsConnected(false); 
      targetVolumesRef.current = { blue: 0, red: 0 };
      addLog("DESCONECTADO"); 
    };
    
    const onVolumeUpdate = (v: any) => {
      if (v) {
        targetVolumesRef.current = {
          blue: typeof v.blue === 'number' ? v.blue : 0,
          red: typeof v.red === 'number' ? v.red : 0
        };
      }
    };
    
    const onStatusUpdate = (s: any) => s && setTeamStatus(s);
    const onResetPeaks = () => resetPeaks();

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('volume_update_dual', onVolumeUpdate);
    socket.on('display_status_update_dual', onStatusUpdate);
    socket.on('reset_peaks', onResetPeaks);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('volume_update_dual', onVolumeUpdate);
      socket.off('display_status_update_dual', onStatusUpdate);
      socket.off('reset_peaks', onResetPeaks);
    };
  }, []);

  const segments = Array.from({ length: 50 }).reverse();

  const VUMeter = ({ volume, peakVol, team, isActive }: { volume: number, peakVol: number, team: 'blue' | 'red', isActive: boolean }) => (
    <div className="flex flex-col items-center gap-4 group flex-1">
      <div className="flex gap-4 h-[550px] items-stretch relative w-full justify-center">
        {/* Marcadores de nivel laterales */}
        <div className="flex flex-col justify-between py-2 text-[10px] font-black text-white/40 font-mono">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>00</span>
        </div>
        
        {/* Contenedor del Termómetro Estilo LEGO Brick */}
        <div className="relative w-24 bg-[#222] rounded-lg border-[6px] border-[#333] p-1 flex flex-col gap-1 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Patrón de "Studs" (bolitas de Lego) de fondo */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-wrap gap-4 p-4 justify-center">
             {Array.from({length: 16}).map((_, i) => (
                 <div key={i} className="w-4 h-4 rounded-full bg-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
             ))}
          </div>
          
          {segments.map((_, i) => {
            const segmentValue = (49 - i) * (100/49);
            const active = volume >= segmentValue;
            const isHistoricalPeak = Math.abs(peakVol - segmentValue) < 1.5;
            
            let colorClass = "bg-white/5";
            if (active) {
              if (segmentValue > 85) colorClass = "bg-[#E3000B] shadow-[0_0_15px_#E3000B]"; // LEGO Red
              else if (segmentValue > 65) colorClass = "bg-[#FFD500] shadow-[0_0_10px_#FFD500]"; // LEGO Yellow
              else colorClass = team === 'blue' 
                ? "bg-[#0055A2] shadow-[0_0_15px_#0055A2]" // LEGO Blue
                : "bg-[#E3000B] shadow-[0_0_15px_#E3000B]"; // LEGO Red
            }

            return (
              <div 
                key={i} 
                className={`flex-1 w-full rounded-sm transition-all duration-100 ${colorClass} relative border-b border-black/20`}
              >
                {isHistoricalPeak && (
                    <div className="absolute inset-0 bg-white shadow-[0_0_15px_white] z-20 animate-pulse border-2 border-white" />
                )}
              </div>
            );
          })}
          
          {/* Indicador de MAX estático - Estilo Lego Tile */}
          <div 
            className="absolute left-0 w-full h-2 bg-white shadow-[0_0_15px_white] z-30 transition-all duration-300 pointer-events-none flex items-center justify-end"
            style={{ bottom: `${peakVol}%` }}
          >
            <div className="bg-white text-black text-[8px] font-black px-1 mr-1 rounded-sm uppercase italic">
                MAX
            </div>
          </div>
        </div>
      </div>

      {/* Base del Termómetro */}
      <div className="relative w-full max-w-[180px]">
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-t-lg text-[9px] font-black tracking-widest z-10 border-x-4 border-t-4 ${
          team === 'blue' ? 'bg-[#0055A2] border-[#003d73] text-white' : 'bg-[#E3000B] border-[#b30009] text-white'
        }`}>
          TEAM_{team.toUpperCase()}
        </div>
        
        <div className="bg-[#333] rounded-xl p-4 border-4 border-[#444] flex flex-col items-center w-full shadow-2xl relative overflow-hidden group-hover:border-[#555] transition-colors">

            <div className="flex items-baseline gap-1 relative">
                <span className={`text-6xl font-mono font-black tabular-nums tracking-tighter drop-shadow-md ${isActive ? 'text-white' : 'text-white/10'}`}>
                    {Math.round(volume).toString().padStart(3, '0')}
                </span>
                <span className="text-gray-500 font-bold text-xl">%</span>
            </div>
            
            {/* Barra de progreso inferior */}
            <div className="w-full h-3 bg-black/40 rounded-full mt-3 overflow-hidden border-2 border-black/20 p-0.5">
                <div 
                    className={`h-full rounded-full transition-all duration-300 ${team === 'blue' ? 'bg-[#0055A2]' : 'bg-[#E3000B]'}`}
                    style={{ width: `${volume}%` }}
                />
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-[95vw] max-w-[1000px] bg-[#1a1a1a] p-8 rounded-[2rem] border-[10px] border-[#333] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col items-center gap-6 font-sans select-none relative overflow-hidden scale-90 origin-top">

      <div className="flex gap-12 w-full justify-center items-center py-4 bg-black/20 rounded-3xl border-4 border-white/5">
        <VUMeter team="blue" volume={displayVolumes.blue} peakVol={peakVolumes.blue} isActive={teamStatus.blue} />
        
        {/* VS Divider - Estilo Lego Brick */}
        <div className="flex flex-col items-center gap-4">
            <div className="w-2 h-16 bg-[#333] rounded-full opacity-30" />
            <div className="relative group">
                <div className="text-7xl font-black text-white/5 italic select-none">VS</div>
            </div>
            <div className="w-2 h-16 bg-[#333] rounded-full opacity-30" />
        </div>

        <VUMeter team="red" volume={displayVolumes.red} peakVol={peakVolumes.red} isActive={teamStatus.red} />
      </div>

      {/* Records Section - Estilo Lego Bricks */}
      <div className="w-full grid grid-cols-2 gap-8">
        <div className="relative overflow-hidden bg-[#0055A2] rounded-2xl p-6 border-b-8 border-[#003d73] shadow-2xl transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                    <span className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">BLUE RECORD</span>
                    <span className="text-[10px] text-white/40 font-bold uppercase italic">Peak Intensity</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-mono font-black text-white drop-shadow-lg">
                        {Math.round(peakVolumes.blue)}
                    </span>
                    <span className="text-white/60 font-black text-xl">%</span>
                </div>
            </div>
        </div>

        <div className="relative overflow-hidden bg-[#E3000B] rounded-2xl p-6 border-b-8 border-[#b30009] shadow-2xl transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                    <span className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">RED RECORD</span>
                    <span className="text-[10px] text-white/40 font-bold uppercase italic">Peak Intensity</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-mono font-black text-white drop-shadow-lg">
                        {Math.round(peakVolumes.red)}
                    </span>
                    <span className="text-white/60 font-black text-xl">%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SoundDisplay;