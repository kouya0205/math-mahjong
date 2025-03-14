import Card from './Card';

interface DiscardPileProps {
  cards: Array<{
    id: string;
    value: string | number;
    type: 'number' | 'operator';
  }>;
}

export default function DiscardPile({ cards }: DiscardPileProps) {
  return (
    <div className="discard-pile">
      <h3 className="text-lg font-semibold mb-2">捨て牌</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {cards.map(card => (
          <Card 
            key={card.id}
            value={card.value}
            type={card.type}
          />
        ))}
      </div>
    </div>
  );
} 