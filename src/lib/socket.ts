import { io, Socket } from 'socket.io-client';

const isBrowser = typeof window !== 'undefined';

export type DummySocket = {
  on: (...args: any[]) => void;
  off: (...args: any[]) => void;
  emit: (...args: any[]) => void;
  connected: boolean;
  id?: string;
};

// Extender el objeto window para almacenar la instancia del socket
declare global {
  interface Window {
    _fll_socket_instance?: Socket;
  }
}

const createSocket = (): DummySocket | Socket => {
  if (!isBrowser) {
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      connected: false,
    };
  }

  // Si ya existe una instancia en window, la reutilizamos
  if (window._fll_socket_instance) {
    return window._fll_socket_instance;
  }

  console.log('🔌 Iniciando nueva conexión de socket...');
  
  const instance = io({
    // Permitimos polling y websocket para máxima compatibilidad
    transports: ['polling', 'websocket'], 
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    path: '/socket.io/',
    // Aseguramos que solo haya una conexión activa por cliente
    rememberUpgrade: true,
  });

  instance.on('connect', () => {
    console.log('✅ SOCKET CONECTADO: ' + instance.id);
  });

  instance.on('disconnect', (reason) => {
    console.log('ℹ️ SOCKET DESCONECTADO: ' + reason);
  });

  instance.on('connect_error', (err) => {
    console.error('❌ FALLO DE CONEXIÓN SOCKET: ' + err.message);
  });

  instance.on('reconnect_attempt', (attempt) => {
    console.log('🔄 Reintentando conexión socket (intento ' + attempt + ')...');
  });

  // Guardamos la instancia en window para futuras importaciones
  window._fll_socket_instance = instance;
  
  return instance;
};

export const socket = createSocket();