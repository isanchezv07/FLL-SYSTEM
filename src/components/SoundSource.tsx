import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';

const SoundSource: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
    console.log(`[SoundSource] ${msg}`);
  };

  useEffect(() => {
    addLog("Iniciando componente...");
    
    const onConnect = () => {
      setIsConnected(true);
      addLog("✅ Socket conectado (ID: " + (socket as any).id + ")");
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
      socket.emit('capture_state', false);
      socket.emit('sound_volume', 0);
    }
  };

  const startListening = async () => {
    setError(null);
    addLog("Solicitando micrófono...");

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
      addLog("🚀 Captura activa");
      
      if (socket.connected) {
        socket.emit('capture_state', true);
      } else {
        addLog("⚠️ Emitiendo sin socket conectado...");
      }
      
      drawAndProcess();
    } catch (err: any) {
      addLog("❌ Error Mic: " + err.name);
      setError(err.name === 'NotAllowedError' ? "Permiso denegado. Revisa la configuración de Safari/Chrome." : "Error: " + err.message);
    }
  };

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
    const normalizedVol = Math.min(100, Math.floor((average / 120) * 100));
    setVolume(normalizedVol);

    if (socket.connected) {
      socket.emit('sound_volume', normalizedVol);
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#60a5fa';
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
      socket.emit('sound_volume', testVol);
      addLog("🧪 Test enviado: " + testVol);
    } else {
      addLog("❌ No se puede enviar test: Socket desconectado");
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-[2.5rem] shadow-2xl text-center border-4 border-slate-800 max-w-md w-full font-sans">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{isConnected ? 'Server Online' : 'Server Offline'}</span>
        </div>
        <button 
          onClick={sendTestData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[8px] font-black px-3 py-1 rounded-full border border-white/10 uppercase"
        >
          Test Connection
        </button>
      </div>

      <div className="bg-black rounded-2xl h-32 mb-6 border-2 border-slate-800 overflow-hidden relative flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={128} className="w-full h-full opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-white/20 italic uppercase tracking-tighter">
            {isListening ? `${volume}%` : 'SILENT'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl mb-6 text-[10px] font-bold uppercase">
          {error}
        </div>
      )}

      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-lg ${
          isListening ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        } uppercase italic tracking-tighter mb-6`}
      >
        {isListening ? 'Detener Emisión' : 'Iniciar Micrófono'}
      </button>

      {/* Consola de Logs */}
      <div className="bg-black/50 rounded-xl p-3 text-left border border-white/5 h-28 overflow-hidden">
        <div className="text-[8px] text-blue-500 font-black uppercase mb-1 tracking-widest">System Logs:</div>
        {logs.map((log, i) => (
          <div key={i} className={`text-[9px] font-mono leading-tight ${i === 0 ? 'text-white' : 'text-slate-500'}`}>
            {`> ${log}`}
          </div>
        ))}
      </div>

      <div className="mt-4 text-[8px] text-slate-600 font-bold uppercase tracking-widest">
        {typeof window !== 'undefined' && window.location.protocol === 'https:' ? '🔒 Conexión Segura Detectada' : '⚠️ Conexión no segura'}
      </div>
    </div>
  );
};

export default SoundSource;
