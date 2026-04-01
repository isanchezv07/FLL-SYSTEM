import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const RemoteSoundVisualizer: React.FC = () => {
  const [volume, setVolume] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Conectar dinámicamente al servidor de micrófono local (puerto 3000)
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const socket = io(`http://${hostname}:3000`);

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('volume_update', (newVolume: number) => {
      setVolume(newVolume);
    });

    socket.on('connect_error', () => {
      setError('No se pudo conectar al servidor de micrófono (¿Está encendido?)');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl shadow-2xl text-white">
      <h2 className="text-2xl font-bold mb-6">Monitor del Servidor</h2>
      
      {!isConnected ? (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{error || 'Conectando al servidor...'}</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="text-center mb-4 text-green-400 font-medium">
            ● Transmitiendo desde el servidor
          </div>
          <div className="text-center mb-4 text-gray-300">
            Intensidad: <span className="font-mono text-blue-400 text-xl">{Math.round(volume)}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-8 overflow-hidden border border-gray-600">
            <div 
              className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-75"
              style={{ width: `${volume}%` }}
            />
          </div>

          <div className="flex justify-center mt-8">
            <div 
              className="rounded-full bg-blue-500 transition-all duration-75"
              style={{ 
                width: `${40 + volume}px`, 
                height: `${40 + volume}px`,
                opacity: 0.3 + (volume / 100),
                boxShadow: `0 0 ${volume}px rgba(59, 130, 246, 0.5)`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteSoundVisualizer;
