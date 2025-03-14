interface OpponentViewProps {
  player: {
    id: string;
    name: string;
    cardCount: number;
    score: number;
  };
  position: number;
}

export default function OpponentView({ player, position }: OpponentViewProps) {
  return (
    <div className="opponent-view p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{player.name}</h3>
        <span className="text-sm bg-gray-200 px-2 py-1 rounded">
          スコア: {player.score}
        </span>
      </div>
      
      <div className="mt-2 flex justify-center">
        {Array.from({ length: player.cardCount }).map((_, i) => (
          <div 
            key={i} 
            className="w-8 h-12 bg-blue-500 rounded mx-1 transform -rotate-6"
            style={{ marginLeft: i > 0 ? '-0.5rem' : '0' }}
          />
        ))}
      </div>
    </div>
  );
} 