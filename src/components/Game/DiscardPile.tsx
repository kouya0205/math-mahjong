interface Card {
  id: string;
  value: number | string;
  type: 'number' | 'operator';
  display: string;
}

interface DiscardPileProps {
  cards: Card[];
}

export default function DiscardPile({ cards }: DiscardPileProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`w-12 h-18 rounded-lg flex items-center justify-center text-lg font-bold ${
            card.type === 'number'
              ? 'bg-gray-200 text-gray-700'
              : 'bg-gray-300 text-gray-700'
          }`}
        >
          {card.display}
        </div>
      ))}
    </div>
  );
} 