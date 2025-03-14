'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import PlayerHand from './PlayerHand';
import PlayerInfo from './PlayerInfo';
import GameInfo from './GameInfo';
import DiscardPile from './DiscardPile';
import GameResult from './GameResult';

interface GameBoardProps {
  gameState: {
    roomId: string;
    playerHand: Array<{
      id: string;
      value: number | string;
      type: 'number' | 'operator';
      display: string;
    }>;
    playerScore: number;
    currentPlayer: {
      id: string;
      name: string;
    } | null;
    players: Array<{
      id: string;
      name: string;
      score: number;
      handCount: number;
      isCurrentPlayer: boolean;
    }>;
    targetNumber: number;
    deckCount: number;
    discardPile: Array<{
      id: string;
      value: number | string;
      type: 'number' | 'operator';
      display: string;
    }>;
    status: 'waiting' | 'playing' | 'finished';
    lastAction: {
      playerId: string;
      playerName: string;
      expression: string;
      value: number;
    } | null;
    winner?: {
      id: string;
      name: string;
      score: number;
    };
  };
  roomId: string;
}

export default function GameBoard({ gameState, roomId }: GameBoardProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const router = useRouter();
  
  // ゲーム終了イベントのリスナー
  useEffect(() => {
    const socket = getSocket();
    
    const handleGameFinished = (data: any) => {
      setWinner(data.winner);
    };
    
    socket.on('gameFinished', handleGameFinished);
    
    return () => {
      socket.off('gameFinished', handleGameFinished);
    };
  }, []);
  
  const handleCardSelect = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
    setError('');
  };
  
  const handleDrawCard = () => {
    if (!isCurrentPlayerTurn || isDrawing) return;
    
    setIsDrawing(true);
    const socket = getSocket();
    
    socket.emit('drawCard', { roomId }, (response: any) => {
      setIsDrawing(false);
      
      if (!response.success) {
        setError(response.message || 'カードを引けませんでした');
      } else {
        setIsDiscarding(true);
      }
    });
  };
  
  const handleDiscardCard = (cardId: string) => {
    if (!isCurrentPlayerTurn || !isDiscarding) return;
    
    setIsDiscarding(false);
    const socket = getSocket();
    
    socket.emit('discardCard', { roomId, cardId }, (response: any) => {
      if (!response.success) {
        setError(response.message || 'カードを捨てられませんでした');
        setIsDiscarding(true);
      }
    });
  };
  
  const handlePlayCards = () => {
    if (selectedCards.length < 3) {
      setError('少なくとも3枚のカードを選択してください');
      return;
    }
    
    setIsSubmitting(true);
    const socket = getSocket();
    
    socket.emit('playCards', { roomId, cardIds: selectedCards }, (response: any) => {
      setIsSubmitting(false);
      
      if (!response.success) {
        setError(response.message || 'カードを出せませんでした');
      } else {
        setSelectedCards([]);
      }
    });
  };
  
  const handlePlayAgain = () => {
    router.push(`/waiting-room/${roomId}`);
  };
  
  const handleBackToHome = () => {
    router.push('/');
  };
  
  // gameState.playersが存在しない場合は空の配列を使用
  const players = gameState.players || [];
  
  // gameState.currentPlayerが存在しない場合はnullを使用
  const currentPlayer = gameState.currentPlayer || null;
  
  // 現在のプレイヤーのターンかどうかを判定
  const isCurrentPlayerTurn = currentPlayer?.id === players.find((p: any) => p.isCurrentPlayer)?.id;
  
  // デバッグ用にゲーム状態をコンソールに出力
  console.log('Game state:', gameState);
  
  // ゲーム終了時の表示
  if (winner || gameState.status === 'finished') {
    const gameWinner = winner || {
      id: gameState.winner?.id,
      name: gameState.winner?.name,
      score: gameState.winner?.score
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <GameResult
          winner={gameWinner}
          onPlayAgain={handlePlayAgain}
          onBackToHome={handleBackToHome}
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ゲーム情報 */}
        <GameInfo 
          currentPlayerName={currentPlayer?.name || '不明なプレイヤー'}
          deckCount={gameState.deckCount || 0}
          targetNumber={gameState.targetNumber || 0}
          lastAction={gameState.lastAction}
        />
        
        {/* プレイヤー情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {players.map((player: any) => (
            <PlayerInfo 
              key={player.id}
              player={player}
              isCurrentPlayer={player.isCurrentPlayer}
            />
          ))}
        </div>
        
        {/* 捨て札 */}
        {gameState.discardPile && gameState.discardPile.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white text-xl mb-2">捨て札</h2>
            <DiscardPile cards={gameState.discardPile || []} />
          </div>
        )}
        
        {/* 自分の手札 */}
        <div className="bg-green-700 p-4 rounded-lg">
          <h2 className="text-white text-xl mb-4">あなたの手札</h2>
          <PlayerHand 
            cards={gameState.playerHand || []}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            isDiscarding={isDiscarding}
            onDiscard={handleDiscardCard}
          />
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}
          
          <div className="mt-4 flex justify-center space-x-4">
            {isCurrentPlayerTurn && !isDiscarding && (
              <button
                className={`px-6 py-2 rounded-lg font-bold ${
                  !isDrawing ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                }`}
                onClick={handleDrawCard}
                disabled={isDrawing}
              >
                {isDrawing ? 'カードを引いています...' : 'カードを引く'}
              </button>
            )}
            
            {isCurrentPlayerTurn && !isDiscarding && (
              <button
                className={`px-6 py-2 rounded-lg font-bold ${
                  !isSubmitting ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                }`}
                onClick={handlePlayCards}
                disabled={isSubmitting}
              >
                {isSubmitting ? '処理中...' : '式を作成'}
              </button>
            )}
            
            {isDiscarding && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                捨てるカードを選択してください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 