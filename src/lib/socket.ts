import { io } from 'socket.io-client';

const isBrowser = typeof window !== 'undefined';

// Get the current hostname for dynamic connection (only in browser).
const hostname = isBrowser ? window.location.hostname : 'localhost';

type DummySocket = {
  on: (...args: any[]) => void;
  off: (...args: any[]) => void;
  emit: (...args: any[]) => void;
  connected: boolean;
};

// Connect to the backend server (only in browser to avoid SSR crash).
export const socket: DummySocket | ReturnType<typeof io> = isBrowser
  ? io(`http://${hostname}:3000`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  : {
      on: () => {},
      off: () => {},
      emit: () => {},
      connected: false,
    };

// Add error handling (browser only).
if (isBrowser) {
  (socket as ReturnType<typeof io>).on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  (socket as ReturnType<typeof io>).on('connect', () => {
    console.log('Socket connected successfully');
  });
}