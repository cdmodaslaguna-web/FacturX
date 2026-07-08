import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

// Instancia Singleton de Socket.io
export const socket = io(API_URL, {
  autoConnect: false, // Evitamos que se conecte automáticamente al cargar el archivo
  transports: ['websocket', 'polling'], // Preferimos websocket
});

export const connectSocket = () => {
  const token = sessionStorage.getItem('facturx_token') || localStorage.getItem('facturx_token');
  
  if (token) {
    socket.auth = { token };
  }
  
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
