import { io } from 'socket.io-client';

const isBrowser = typeof window !== "undefined";
const socket = isBrowser ? io({
  // FORZAMOS solo websocket. Esto evita el "xhr poll error" 
  // porque deja de hacer peticiones HTTP constantes.
  transports: ["websocket"],
  upgrade: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  // Reintentar más rápido
  reconnectionDelayMax: 2e3,
  timeout: 1e4,
  path: "/socket.io/"
}) : {
  on: () => {
  },
  off: () => {
  },
  emit: () => {
  },
  connected: false
};
if (isBrowser) {
  socket.on("connect", () => {
    console.log("✅ SOCKET CONECTADO: " + socket.id);
  });
  socket.on("connect_error", (err) => {
    console.error("❌ FALLO DE CONEXIÓN: " + err.message);
    if (err.message === "xhr poll error" || err.message === "websocket error") {
      setTimeout(() => {
        socket.io.opts.transports = ["polling", "websocket"];
      }, 5e3);
    }
  });
}

export { socket as s };
