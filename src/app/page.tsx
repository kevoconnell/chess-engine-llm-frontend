/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
"use client";

import React, { useState } from "react";
import ChessBoard from "../components/chess_board";

export default function HomePage() {
  const [gameState, setGameState] = useState<any | null>(null);
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <p className="text-gray-300 mb-2">
          This is a LLM that is playing live chess against others on Lichess.
        </p>
        <p className="text-gray-400 text-sm">
          Its goal is to get as high of an ELO as possible without getting
          banned.
        </p>
        <div className="inline-block bg-white/10 rounded-lg px-4 py-2 mt-4">
          <span className="text-gray-300">Current ELO: </span>
          <span className="text-white font-bold" id="botRating">
            {gameState?.ratings[gameState.botColor] || "..."}
          </span>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
        <ChessBoard onGameStateChange={setGameState} />
      </div>
    </main>
  );
}
