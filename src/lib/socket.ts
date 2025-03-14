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
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true
    });
    
    // デバッグ用のイベントリスナー
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // gameStateイベントのデバッグ
    socket.on('gameState', (data) => {
      console.log('Received game state:', data);
      console.log('Players with hand:', data.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        hasHand: !!p.hand,
        handLength: p.hand ? p.hand.length : 0
      })));
    });
  }
  
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 