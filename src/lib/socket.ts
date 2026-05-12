import { io } from 'socket.io-client';

const isBrowser = typeof window !== 'undefined';

export type DummySocket = {
  on: (...args: any[]) => void;
  off: (...args: any[]) => void;
  emit: (...args: any[]) => void;
  connected: boolean;
};

export const socket: DummySocket | ReturnType<typeof io> = isBrowser
  ? io({
      // FORZAMOS solo websocket. Esto evita el "xhr poll error" 
      // porque deja de hacer peticiones HTTP constantes.
      transports: ['websocket'], 
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500, // Reintentar más rápido
      reconnectionDelayMax: 2000,
      timeout: 10000,
      path: '/socket.io/',
    })
  : {
      on: () => {},
      off: () => {},
      emit: () => {},
      connected: false,
    };

if (isBrowser) {
  (socket as ReturnType<typeof io>).on('connect', () => {
    console.log('✅ SOCKET CONECTADO: ' + (socket as any).id);
  });

  (socket as ReturnType<typeof io>).on('connect_error', (err) => {
    console.error('❌ FALLO DE CONEXIÓN: ' + err.message);
    // Si falla websocket, intentamos habilitar polling como último recurso después de 5 segundos
    if (err.message === 'xhr poll error' || err.message === 'websocket error') {
       setTimeout(() => {
         (socket as any).io.opts.transports = ['polling', 'websocket'];
       }, 5000);
    }
  });
}