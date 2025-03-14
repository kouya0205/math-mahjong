interface Card {
  id: string;
  value: number | string;
  type: 'number' | 'operator';
  display: string;
}

interface OpponentProps {
  player: {
    id: string;
    name: string;
    score: number;
    handCount: number;
    isCurrentPlayer: boolean;
    hand?: Card[]; // 手札情報
  };
  position: number;
  myPlayerId: string; // 自分のプレイヤーIDを追加
}

export default function OpponentView({ player, position, myPlayerId }: OpponentProps) {
  // デバッグ用にプレイヤー情報をコンソールに出力
  console.log('Opponent player:', player);
  console.log('Opponent hand:', player.hand);
  console.log('My player ID:', myPlayerId);
  console.log('Is this my card?', player.id === myPlayerId);
  
  // 自分のカードでないことを確認
  const isOpponent = player.id !== myPlayerId;
  
  return (
    <div className={`bg-gray-700 p-4 rounded-lg ${player.isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-bold">{player.name}</h3>
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {player.score}点
        </span>
      </div>
      
      <div className="flex justify-center">
        {/* 手札を表向きで表示（相手のカードの場合のみ） */}
        <div className="flex flex-wrap justify-center gap-1">
          {isOpponent && player.hand && player.hand.length > 0 ? (
            player.hand.map((card) => (
              <div 
                key={card.id} 
                className={`w-10 h-14 flex items-center justify-center rounded-md text-sm font-bold ${
                  card.type === 'number' 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {card.display}
              </div>
            ))
          ) : (
            // 手札情報がない場合は枚数だけ表示
            Array.from({ length: player.handCount }).map((_, i) => (
              <div 
                key={i} 
                className="w-10 h-14 bg-gray-800 border border-gray-600 rounded-md flex items-center justify-center text-gray-400"
              >
                ?
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 