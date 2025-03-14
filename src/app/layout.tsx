import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"
import { RoomProvider } from "@/context/RoomContext";
import { GameProvider } from "@/context/GameContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "数学麻雀（Math Mahjong）",
  description: "数式を作って対戦する麻雀風カードゲーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <RoomProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </RoomProvider>
      </body>
    </html>
  );
}
