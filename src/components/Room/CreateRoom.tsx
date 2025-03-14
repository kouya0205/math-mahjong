'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import { initSocket } from '@/lib/socket';

export default function CreateRoom() {
  const [playerName, setPlayerName] = useState('');
  const [gameMode, setGameMode] = useState('standard');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const socket = initSocket();
      
      socket.emit('createRoom', { playerName, gameMode }, (response: { success: boolean, roomId: string }) => {
        if (response.success) {
          router.push(`/game/${response.roomId}`);
        } else {
          alert('部屋の作成に失敗しました。もう一度お試しください。');
          setIsCreating(false);
        }
      });
    } catch (error) {
      console.error('Error creating room:', error);
      alert('部屋の作成中にエラーが発生しました。');
      setIsCreating(false);
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
        <label htmlFor="gameMode" className="block text-sm font-medium text-gray-700 mb-1">
          ゲームモード
        </label>
        <select
          id="gameMode"
          value={gameMode}
          onChange={(e) => setGameMode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="standard">標準</option>
          <option value="advanced">上級</option>
          <option value="kids">キッズ</option>
        </select>
      </div>
      
      <Button 
        type="submit" 
        disabled={isCreating || !playerName}
        className="w-full"
      >
        {isCreating ? '作成中...' : '部屋を作成'}
      </Button>
    </form>
  );
} 