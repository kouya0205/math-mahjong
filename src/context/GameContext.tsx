'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// ゲーム状態の型定義
interface GameState {
  roomId: string;
  playerHand: {
    id: string;
    value: number | string;
    type: 'number' | 'operator';
    display: string;
  }[];
  playerScore: number;
  currentPlayer: {
    id: string;
    name: string;
  } | null;
  players: {
    id: string;
    name: string;
    score: number;
    handCount: number;
    isCurrentPlayer: boolean;
  }[];
  targetNumber: number;
  deckCount: number;
  discardPile: {
    id: string;
    value: number | string;
    type: 'number' | 'operator';
    display: string;
  }[];
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
}

interface GameContextType {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

// デフォルト値を設定
const defaultGameState: GameState = {
  roomId: '',
  playerHand: [],
  playerScore: 0,
  currentPlayer: null,
  players: [],
  targetNumber: 0,
  deckCount: 0,
  discardPile: [],
  status: 'waiting',
  lastAction: null
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 