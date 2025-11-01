import { io } from 'socket.io-client';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // 배포 환경 기본값
  return 'https://backend-nwiq.onrender.com';
};

let socket = null;

export const initializeSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  const apiBaseUrl = getApiBaseUrl();
  socket = io(apiBaseUrl, {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ [Socket] Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('⚠️ [Socket] Disconnected from server');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ [Socket] Connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

