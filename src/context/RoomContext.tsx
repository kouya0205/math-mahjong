'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initSocket, getSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';

interface RoomContextType {
  createRoom: (playerName: string, gameMode: string) => Promise<{ success: boolean; roomId?: string; message?: string }>;
  joinRoom: (playerName: string, roomId: string) => Promise<{ success: boolean; message?: string }>;
  startGame: (roomId: string) => Promise<{ success: boolean; message?: string }>;
  roomData: {
    roomId: string;
    players: { name: string; isHost: boolean }[];
    status: 'waiting' | 'playing' | 'finished';
  } | null;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomData, setRoomData] = useState<RoomContextType['roomData']>(null);
  const router = useRouter();

  useEffect(() => {
    // コンポーネントマウント時にSocket.io接続を初期化
    const socket = initSocket();
    
    // ルーム更新イベントのリスナー
    socket.on('roomUpdate', (data) => {
      console.log('Room update received:', data);
      setRoomData(data);
    });
    
    // ゲーム開始イベントのリスナー
    socket.on('gameStarted', () => {
      console.log('Game started event received');
      if (roomData?.roomId) {
        router.push(`/game/${roomData.roomId}`);
      }
    });
    
    // クリーンアップ関数
    return () => {
      socket.off('roomUpdate');
      socket.off('gameStarted');
      // 接続は切断しない（アプリ全体で維持）
    };
  }, [roomData?.roomId, router]);

  // ルーム作成関数
  const createRoom = async (playerName: string, gameMode: string): Promise<{ success: boolean; roomId?: string; message?: string }> => {
    return new Promise((resolve) => {
      const socket = getSocket();
      socket.emit('createRoom', { playerName, gameMode }, (response: any) => {
        console.log('Create room response:', response);
        if (response.success) {
          resolve({ success: true, roomId: response.roomId });
        } else {
          resolve({ success: false, message: response.message || 'ルーム作成に失敗しました' });
        }
      });
    });
  };

  // ルーム参加関数
  const joinRoom = async (playerName: string, roomId: string): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      const socket = getSocket();
      socket.emit('joinRoom', { playerName, roomId }, (response: any) => {
        console.log('Join room response:', response);
        if (response.success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, message: response.message || 'ルーム参加に失敗しました' });
        }
      });
    });
  };

  // ゲーム開始関数
  const startGame = async (roomId: string): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      const socket = getSocket();
      socket.emit('startGame', { roomId }, (response: any) => {
        console.log('Start game response:', response);
        if (response.success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, message: response.message || 'ゲーム開始に失敗しました' });
        }
      });
    });
  };

  return (
    <RoomContext.Provider value={{ createRoom, joinRoom, startGame, roomData }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
} 