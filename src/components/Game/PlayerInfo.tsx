interface Player {
  id: string;
  name: string;
  score: number;
  handCount: number;
  isCurrentPlayer: boolean;
}

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export default function PlayerInfo({ player, isCurrentPlayer }: PlayerInfoProps) {
  // プロパティが存在しない場合のフォールバック
  const playerName = player.name || '不明なプレイヤー';
  const playerScore = player.score || 0;
  const playerHandCount = player.handCount || 0;
  
  return (
    <div className={`p-4 rounded-lg ${isCurrentPlayer ? 'bg-yellow-500' : 'bg-gray-700'}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold">{playerName}</h3>
        {isCurrentPlayer && (
          <span className="bg-white text-yellow-600 text-xs px-2 py-1 rounded">
            現在のプレイヤー
          </span>
        )}
      </div>
      <div className="mt-2 flex justify-between text-white">
        <span>スコア: {playerScore}</span>
        <span>手札: {playerHandCount}枚</span>
      </div>
    </div>
  );
} 