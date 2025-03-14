interface LastAction {
  playerId: string;
  playerName: string;
  expression: string;
  value: number;
}

interface GameInfoProps {
  currentPlayerName: string;
  deckCount: number;
  targetNumber: number;
  lastAction?: LastAction;
}

export default function GameInfo({ 
  currentPlayerName, 
  deckCount, 
  targetNumber,
  lastAction 
}: GameInfoProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl">現在のプレイヤー: {currentPlayerName}</h2>
          <p className="text-sm text-gray-300">残りカード: {deckCount}枚</p>
        </div>
        <div className="bg-yellow-500 px-4 py-2 rounded-lg">
          <p className="text-lg font-bold">目標数字: {targetNumber}</p>
        </div>
      </div>
      
      {lastAction && (
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-sm">最後のアクション:</p>
          <p className="font-bold">{lastAction.playerName}さんが「{lastAction.expression} = {lastAction.value}」を作成</p>
        </div>
      )}
    </div>
  );
} 