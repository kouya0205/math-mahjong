'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import { initSocket } from '@/lib/socket';

export default function JoinRoom() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    
    try {
      const socket = initSocket();
      
      socket.emit('joinRoom', { playerName, roomId }, (response: { success: boolean, message?: string }) => {
        if (response.success) {
          router.push(`/game/${roomId}`);
        } else {
          alert(`参加に失敗しました: ${response.message || '不明なエラー'}`);
          setIsJoining(false);
        }
      });
    } catch (error) {
      console.error('Error joining room:', error);
      alert('部屋への参加中にエラーが発生しました。');
      setIsJoining(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
          プレイヤー名
        </label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <div>
        <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
          ルームID
        </label>
        <input
          type="text"
          id="roomId"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isJoining || !playerName || !roomId}
        className="w-full"
      >
        {isJoining ? '参加中...' : '部屋に参加'}
      </Button>
    </form>
  );
} 