'use client';

import { useEffect, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import Card from './Card';
import PlayerHand from './PlayerHand';
import DiscardPile from './DiscardPile';
import OpponentView from './OpponentView';
import { getSocket } from '@/lib/socket';

interface GameBoardProps {
  roomId: string;
}

export default function GameBoard({ roomId }: GameBoardProps) {
  const { gameState, setGameState } = useGameContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const socket = getSocket();
    
    socket.on('gameState', (newState) => {
      setGameState(newState);
      setIsLoading(false);
    });

    socket.emit('getGameState', { roomId });

    return () => {
      socket.off('gameState');
    };
  }, [roomId, setGameState]);

  if (isLoading) {
    return <div className="text-center p-8">ゲームデータを読み込み中...</div>;
  }

  return (
    <div className="game-board">
      <div className="opponents-area">
        {gameState.opponents.map((opponent, index) => (
          <OpponentView key={index} player={opponent} position={index} />
        ))}
      </div>
      
      <div className="center-area">
        <DiscardPile cards={gameState.discardPile} />
      </div>
      
      <div className="player-area">
        <PlayerHand cards={gameState.playerHand} />
      </div>
    </div>
  );
} 