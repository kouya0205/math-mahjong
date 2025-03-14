import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">数学麻雀（Math Mahjong）</h1>
      <div className="flex gap-4 mb-8">
        <Link href="/create-room">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            部屋を作成
          </button>
        </Link>
        <Link href="/join-room">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            部屋に参加
          </button>
        </Link>
      </div>
      <Link href="/rules">
        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          ゲームルールを見る
        </button>
      </Link>
    </main>
  );
}
