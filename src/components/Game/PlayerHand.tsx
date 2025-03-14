interface Card {
  id: string;
  value: number | string;
  type: 'number' | 'operator';
  display: string;
}

interface PlayerHandProps {
  cards: Card[];
  selectedCards: string[];
  onCardSelect: (cardId: string) => void;
  isDiscarding?: boolean;
  onDiscard?: (cardId: string) => void;
}

export default function PlayerHand({ 
  cards, 
  selectedCards, 
  onCardSelect,
  isDiscarding = false,
  onDiscard
}: PlayerHandProps) {
  const handleCardClick = (cardId: string) => {
    if (isDiscarding && onDiscard) {
      onDiscard(cardId);
    } else {
      onCardSelect(cardId);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`w-16 h-24 rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer transition-transform ${
            isDiscarding 
              ? 'bg-red-100 hover:bg-red-200 text-gray-800'
              : selectedCards.includes(card.id)
                ? 'bg-yellow-300 text-gray-800 transform -translate-y-2'
                : card.type === 'number'
                  ? 'bg-white text-gray-800 hover:bg-yellow-100'
                  : 'bg-blue-200 text-gray-800 hover:bg-blue-300'
          }`}
          onClick={() => handleCardClick(card.id)}
        >
          {card.display}
        </div>
      ))}
    </div>
  );
} 