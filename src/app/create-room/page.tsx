'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/context/RoomContext';

export default function CreateRoom() {
  const [playerName, setPlayerName] = useState('');
  const [gameMode, setGameMode] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { createRoom } = useRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await createRoom(playerName, gameMode);
      if (result.success && result.roomId) {
        router.push(`/waiting-room/${result.roomId}`);
      } else {
        setError(result.message || 'ルーム作成に失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">部屋を作成</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="playerName">
              プレイヤー名
            </label>
            <input
              id="playerName"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gameMode">
              ゲームモード
            </label>
            <select
              id="gameMode"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
            >
              <option value="standard">標準</option>
              <option value="advanced">上級</option>
              <option value="kids">キッズ</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => router.push('/')}
            >
              戻る
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            >
              {isLoading ? '作成中...' : '部屋を作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 