import Card from './Card';
import { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { getSocket } from '@/lib/socket';

interface PlayerHandProps {
  cards: Array<{
    id: string;
    value: string | number;
    type: 'number' | 'operator';
  }>;
}

export default function PlayerHand({ cards }: PlayerHandProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const { gameState } = useGameContext();

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const playSelectedCards = () => {
    if (selectedCards.length < 3) return;
    
    const socket = getSocket();
    socket.emit('playCards', {
      roomId: gameState.roomId,
      cardIds: selectedCards
    });
    
    setSelectedCards([]);
  };

  return (
    <div className="player-hand">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {cards.map(card => (
          <Card 
            key={card.id}
            value={card.value}
            type={card.type}
            isSelected={selectedCards.includes(card.id)}
            onClick={() => toggleCardSelection(card.id)}
          />
        ))}
      </div>
      
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        disabled={selectedCards.length < 3}
        onClick={playSelectedCards}
      >
        カードを出す
      </button>
    </div>
  );
} 