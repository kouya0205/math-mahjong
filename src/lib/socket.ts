import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket || !socket.connected) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // 接続イベントのリスナー
    socket.on('connect', () => {
      console.log('Socket.io接続成功:', socket?.id);
    });
    
    // 切断イベントのリスナー
    socket.on('disconnect', (reason) => {
      console.log('Socket.io切断:', reason);
    });
    
    // 再接続イベントのリスナー
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket.io再接続成功 (${attemptNumber}回目)`);
    });
    
    // エラーイベントのリスナー
    socket.on('connect_error', (err) => {
      console.error('Socket.io接続エラー:', err);
    });
  }
  
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket || !socket.connected) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 