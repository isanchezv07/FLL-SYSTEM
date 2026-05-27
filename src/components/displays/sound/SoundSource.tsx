import React, { useState, useEffect, useRef } from 'react';
import { socket } from '@/lib/socket';

const SoundSource: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [team, setTeam] = useState<'blue' | 'red'>('blue');
  const [volume, setVolume] = useState(0);
  const [sensitivity, setSensitivity] = useState(120);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sensitivityRef = useRef(120);
  const teamRef = useRef<'blue' | 'red'>('blue');

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
    console.log(`[SoundSource] ${msg}`);
  };

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  useEffect(() => {
    teamRef.current = team;
    // Si estamos escuchando, notificamos al server el cambio de equipo
    if (isListening && socket.connected) {
        socket.emit('capture_state', { team, isActive: true });
    }
  }, [team]);

  useEffect(() => {
    addLog("Iniciando componente...");
    
    const onConnect = () => {
      setIsConnected(true);
      addLog("✅ Socket conectado (ID: " + (socket as any).id + ")");
      if (isListening) {
        socket.emit('capture_state', { team: teamRef.current, isActive: true });
      }
    };
    
    const onDisconnect = () => {
      setIsConnected(false);
      addLog("❌ Socket desconectado");
    };

    const onConnectError = (err: any) => {
      addLog("⚠️ Error de conexión: " + err.message);
    };

    if (socket.connected) onConnect();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
    }
    setIsListening(false);
    setVolume(0);
    addLog("Captura detenida");
    
    if (socket.connected) {
      socket.emit('capture_state', { team: teamRef.current, isActive: false });
      socket.emit('sound_volume', { team: teamRef.current, volume: 0 });
    }
  };

  const startListening = async () => {
    setError(null);
    addLog("Solicitando micrófono...");

    // Verificar si el navegador soporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isNotSecure = window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      if (isNotSecure) {
        setError("ERROR: El micrófono requiere HTTPS para funcionar en dispositivos móviles. Usa localhost o configura un túnel seguro (ngrok).");
        addLog("❌ Error: Contexto no seguro");
      } else {
        setError("Tu navegador no soporta acceso al micrófono.");
        addLog("❌ Error: MediaDevices no soportado");
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog("🎤 Micrófono concedido");
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      if (ctx.state === 'suspended') {
        addLog("Reanudando AudioContext...");
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4; // Más rápido para mejor respuesta
      
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsListening(true);
      addLog("🚀 Captura activa para EQUIPO " + teamRef.current.toUpperCase());
      
      if (socket.connected) {
        socket.emit('capture_state', { team: teamRef.current, isActive: true });
      } else {
        addLog("⚠️ Emitiendo sin socket conectado...");
      }
      
      drawAndProcess();
    } catch (err: any) {
      addLog("❌ Error Mic: " + err.name);
      setError(err.name === 'NotAllowedError' ? "Permiso denegado. Revisa la configuración de Safari/Chrome." : "Error: " + err.message);
    }
  };

  const lastEmitRef = useRef<number>(0);

  const drawAndProcess = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calcular volumen con mayor sensibilidad
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    
    // Normalización agresiva: el valor 60 suele ser un ruido ambiente normal, 150 es fuerte.
    // Usamos el valor de sensibilidad del slider (por defecto 120)
    const normalizedVol = Math.min(100, Math.floor((average / sensitivityRef.current) * 100));
    setVolume(normalizedVol);

    // Throttled emission (max ~20 times per second)
    const now = Date.now();
    if (socket.connected && now - lastEmitRef.current > 50) {
      socket.emit('sound_volume', { team: teamRef.current, volume: normalizedVol });
      lastEmitRef.current = now;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = teamRef.current === 'blue' ? '#3b82f6' : '#ef4444';
        const barWidth = (canvas.width / dataArrayRef.current.length) * 2;
        let x = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const barHeight = (dataArrayRef.current[i] / 255) * canvas.height;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(drawAndProcess);
  };

  const sendTestData = () => {
    if (socket.connected) {
      const testVol = Math.floor(Math.random() * 100);
      socket.emit('sound_volume', { team, volume: testVol });
      addLog(`🧪 Test ${team}: ${testVol}`);
    } else {
      addLog("❌ No se puede enviar test: Socket desconectado");
    }
  };

  const resetAllPeaks = () => {
    if (socket.connected) {
      socket.emit('reset_peaks');
      addLog("🧹 Comando: RESET ALL PEAKS");
    } else {
      addLog("❌ Error: Socket desconectado");
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-[2.5rem] shadow-2xl text-center border-4 border-slate-800 max-w-md w-full font-sans">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{isConnected ? 'Server Online' : 'Server Offline'}</span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={resetAllPeaks}
                className="bg-red-900/40 hover:bg-red-800/60 text-red-400 text-[8px] font-black px-3 py-1 rounded-full border border-red-500/30 uppercase"
            >
                Reset Peaks
            </button>
            <button 
                onClick={sendTestData}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[8px] font-black px-3 py-1 rounded-full border border-white/10 uppercase"
            >
                Test
            </button>
        </div>
      </div>

      <div className="bg-black rounded-2xl h-32 mb-6 border-2 border-slate-800 overflow-hidden relative flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={128} className="w-full h-full opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-4xl font-black italic uppercase tracking-tighter ${isListening ? (team === 'blue' ? 'text-blue-500/40' : 'text-red-500/40') : 'text-white/20'}`}>
            {isListening ? `${volume}%` : 'SILENT'}
          </span>
        </div>
      </div>

      <div className="mb-6 px-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sensibilidad Mic</label>
          <span className="text-[10px] text-blue-400 font-black">{sensitivity}</span>
        </div>
        <input 
          type="range" 
          min="20" 
          max="255" 
          value={sensitivity} 
          onChange={(e) => setSensitivity(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-slate-600 font-bold uppercase">Más Sensible</span>
          <span className="text-[8px] text-slate-600 font-bold uppercase">Menos Sensible</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl mb-6 text-[10px] font-bold uppercase">
          {error}
        </div>
      )}

      {/* Consola de Logs */}
      <div className="bg-black/50 rounded-xl p-3 text-left border border-white/5 h-28 overflow-hidden mb-6">
        <div className="text-[8px] text-blue-500 font-black uppercase mb-1 tracking-widest">System Logs:</div>
        {logs.map((log, i) => (
          <div key={i} className={`text-[9px] font-mono leading-tight ${i === 0 ? 'text-white' : 'text-slate-500'}`}>
            {`> ${log}`}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {!isListening ? (
            <div className="flex gap-4">
                <button
                    onClick={() => { setTeam('blue'); startListening(); }}
                    className="flex-1 py-8 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-lg bg-blue-600 text-white border-b-8 border-blue-800 uppercase italic tracking-tighter"
                >
                    Mic Azul
                </button>
                <button
                    onClick={() => { setTeam('red'); startListening(); }}
                    className="flex-1 py-8 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-lg bg-red-600 text-white border-b-8 border-red-800 uppercase italic tracking-tighter"
                >
                    Mic Rojo
                </button>
            </div>
        ) : (
            <button
                onClick={stopListening}
                className="w-full py-8 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-lg bg-slate-700 text-white border-b-8 border-slate-900 uppercase italic tracking-tighter"
            >
                Detener Mic {team === 'blue' ? 'Azul' : 'Rojo'}
            </button>
        )}
      </div>

      <div className="mt-4 text-[8px] text-slate-600 font-bold uppercase tracking-widest">
        {typeof window !== 'undefined' && window.location.protocol === 'https:' ? '🔒 Conexión Segura Detectada' : '⚠️ Conexión no segura'}
      </div>
    </div>
  );
};

export default SoundSource;
