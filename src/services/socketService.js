import SocketIOClient from 'socket.io-client';
import { SOCKET_URL } from '@env'; // 👈 ADD THIS

let socket = null;

export const connectSocket = callerId => {
  if (socket && socket.connected) return socket;

  socket = SocketIOClient(SOCKET_URL, {
    transports: ['websocket'],
    query: {callerId},
  });

  socket.on('connect', () => console.log('Socket connected as:', callerId));
  socket.on('disconnect', () => console.log('Socket disconnected'));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;