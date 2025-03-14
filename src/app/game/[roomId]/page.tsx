'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { useGame } from '@/context/GameContext';
import GameBoard from '@/components/Game/GameBoard';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function GamePage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const { gameState, setGameState } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = getSocket();
    
    console.log('ゲーム画面マウント - ソケット接続状態:', socket.connected);
    
    // ゲーム状態取得
    const getInitialGameState = () => {
      console.log('ゲーム状態リクエスト送信:', roomId);
      socket.emit('getGameState', { roomId });
    };
    
    // 接続されていない場合は接続を待つ
    if (!socket.connected) {
      socket.on('connect', () => {
        console.log('ソケット再接続成功 - ゲーム状態リクエスト送信');
        getInitialGameState();
      });
    } else {
      getInitialGameState();
    }
    
    // ゲーム状態受信ハンドラー
    const handleGameState = (state: any) => {
      console.log('ゲーム状態受信:', state);
      console.log('players配列:', state.players);
      console.log('currentPlayer:', state.currentPlayer);
      setGameState(state);
      setIsLoading(false);
    };
    
    // ゲーム終了ハンドラー
    const handleGameOver = (data: any) => {
      console.log('ゲーム終了:', data);
      router.push(`/game-result/${roomId}`);
    };
    
    // エラーハンドラー
    const handleError = (errorMsg: string) => {
      console.error('ゲームエラー:', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
    };
    
    // イベントリスナー登録
    socket.on('gameState', handleGameState);
    socket.on('gameOver', handleGameOver);
    socket.on('gameError', handleError);
    
    // 30秒後もロード中なら、エラーメッセージを表示
    
    
    // クリーンアップ
    return () => {
      socket.off('gameState', handleGameState);
      socket.off('gameOver', handleGameOver);
      socket.off('gameError', handleError);
      // clearTimeout(timeoutId);
    };
  }, [roomId, router, setGameState]);

  // ロード中表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <LoadingSpinner />
        <p className="mt-4 text-lg">ゲームデータを読み込み中...</p>
      </div>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/')}
        >
          ホームに戻る
        </button>
      </div>
    );
  }
  
  // ゲーム画面表示
  return <GameBoard gameState={gameState} roomId={roomId} />;
} 