interface Winner {
  id: string;
  name: string;
  score: number;
}

interface GameResultProps {
  winner: Winner;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export default function GameResult({ winner, onPlayAgain, onBackToHome }: GameResultProps) {
  return (
    <div className="bg-gray-800 p-8 rounded-lg text-white text-center">
      <h2 className="text-3xl font-bold mb-6">ゲーム終了</h2>
      
      <div className="bg-yellow-500 p-6 rounded-lg mb-8">
        <p className="text-xl mb-2">勝者</p>
        <h3 className="text-4xl font-bold mb-2">{winner.name}</h3>
        <p className="text-2xl">スコア: {winner.score}点</p>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onPlayAgain}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
        >
          もう一度プレイ
        </button>
        
        <button
          onClick={onBackToHome}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
} 