import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    const serverUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    socket = io(serverUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true
    });
  }
  return socket;
};

export const joinHouseholdRoom = (householdId) => {
  const s = getSocket();
  if (s && householdId) {
    s.emit('join:household', householdId);
  }
};

export const leaveHouseholdRoom = (householdId) => {
  const s = getSocket();
  if (s && householdId) {
    s.emit('leave:household', householdId);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
