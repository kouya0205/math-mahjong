import Link from 'next/link';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">数学麻雀のルール</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">ゲームの概要</h2>
          <p className="mb-4">
            数学麻雀は、麻雀をベースにした数学的な思考力を競うカードゲームです。
            プレイヤーは手札のカードを使って、目標となる数字を作成することを目指します。
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">カード構成</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>数字カード: 0〜9の各4枚ずつ（計40枚）</li>
            <li>演算子カード: +, -, *, /, √, !, ^の各4枚ずつ（計28枚）</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">ゲームの流れ</h2>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>ゲーム開始:</strong> ゲーム開始時に山札から3枚のカードを引き、基準となる数字（目標数字）を作成します。
            </li>
            <li>
              <strong>手札の配布:</strong> 各プレイヤーに6枚のカードを配布します。
            </li>
            <li>
              <strong>ターンの進行:</strong> プレイヤーは順番に以下のアクションを行います。
              <ul className="list-disc pl-6 mt-2">
                <li>山札から1枚カードを引く</li>
                <li>手札から1枚カードを捨てる</li>
              </ul>
            </li>
            <li>
              <strong>上がり:</strong> 手札の7枚を使って目標数字を作成できたら「ツモ上がり」となります。
            </li>
          </ol>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">演算のルール</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>演算の順番は基本に則ります（^, √, !, ×, ÷, +, -）</li>
            <li>カッコを用いた演算順番の変更はありません</li>
            <li>例: 2^3×4+5 = 8×4+5 = 32+5 = 37</li>
            <li>√演算子は右側の数字に適用されます（例: √9 = 3）</li>
            <li>!演算子は左側の数字に適用されます（例: 5! = 120）</li>
            <li>^演算子は左側の数字を右側の数字で累乗します（例: 2^3 = 8）</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">得点計算</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>基本点: 使用したカードの枚数×10点</li>
            <li>+, -: 各5点</li>
            <li>×, ÷: 各10点</li>
            <li>√: 20点</li>
            <li>!: 25点</li>
            <li>^: 30点</li>
          </ul>
        </div>
        
        <div className="flex justify-center mt-8">
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              ホームに戻る
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 