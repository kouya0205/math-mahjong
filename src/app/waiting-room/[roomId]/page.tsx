'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoom } from '@/context/RoomContext';
import { getSocket } from '@/lib/socket';

export default function WaitingRoom() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const { roomData, startGame } = useRoom();
  
  useEffect(() => {
    // ルームデータがない場合、サーバーからルーム情報を取得
    if (!roomData) {
      const socket = getSocket();
      socket.emit('getRoomInfo', { roomId }, (response: any) => {
        if (!response.success) {
          router.push('/');
        }
      });
    }
    
    // ゲームが既に始まっている場合はゲーム画面に遷移
    if (roomData?.status === 'playing') {
      router.push(`/game/${roomId}`);
    }
  }, [roomData, roomId, router]);

  const handleStartGame = async () => {
    const result = await startGame(roomId);
    if (!result.success) {
      alert(result.message);
    }
  };

  const isHost = roomData?.players.some(p => p.isHost);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">待機ルーム</h1>
        
        <div className="mb-4">
          <p className="text-gray-700">ルームID: <span className="font-bold">{roomId}</span></p>
          <p className="text-gray-700 mt-2">このIDを他のプレイヤーに共有して招待しましょう</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">参加者</h2>
          {roomData?.players && roomData.players.length > 0 ? (
            <ul className="border rounded divide-y">
              {roomData.players.map((player, index) => (
                <li key={index} className="px-4 py-2 flex justify-between items-center">
                  <span>{player.name}</span>
                  {player.isHost && <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">ホスト</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">プレイヤーを読み込み中...</p>
          )}
        </div>
        
        <div className="flex justify-between">
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => router.push('/')}
          >
            退出
          </button>
          
          {isHost && (
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleStartGame}
              disabled={!roomData || roomData.players.length < 2}
            >
              ゲーム開始
            </button>
          )}
        </div>
        
        {isHost && roomData?.players.length < 2 && (
          <p className="text-red-500 text-sm mt-2 text-center">ゲームを開始するには少なくとも2人のプレイヤーが必要です</p>
        )}
      </div>
    </div>
  );
}