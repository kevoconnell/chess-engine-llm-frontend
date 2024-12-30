/* eslint-disable react-hooks/exhaustive-deps */
// components/chess_board.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

interface GameState {
  fen: string;
  lastMove?: string | null;
  isOurTurn: boolean;
  type: "gameStart" | "gameState" | "error";
  message?: string;
  playerColor?: "white" | "black";
  ratings: {
    white: number;
    black: number;
  };
  timeLeft?: {
    white: number;
    black: number;
  };
  botColor: "white" | "black";
  positionAdvantage?: number;
  chatMessages?: Array<{
    text: string;
    username: string;
    time: string;
  }>;
}

// Add this near the top of the file, after imports
const SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

// Create the custom hook
function useGameEvents() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${SERVER_BASE_URL}/api/events`);

    eventSource.addEventListener("gameState", (event) => {
      const data = JSON.parse(event.data);
      setGameState(data);
    });

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return gameState;
}

// Add this new hook at the top level
function useGameTimer(gameState: GameState | null) {
  const [timeLeft, setTimeLeft] = useState<{ white: number; black: number }>({
    white: 0,
    black: 0,
  });

  useEffect(() => {
    // Initialize times when gameState changes
    if (gameState?.timeLeft) {
      setTimeLeft(gameState.timeLeft);
    }
  }, [gameState?.timeLeft]);

  useEffect(() => {
    if (!gameState || gameState.type === "error") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const isWhiteTurn =
          !gameState.lastMove || gameState.lastMove.length % 2 === 1;

        return {
          white: prev.white - (isWhiteTurn ? 100 : 0),
          black: prev.black - (!isWhiteTurn ? 100 : 0),
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState]);

  return timeLeft;
}

export default function ChessBoard({
  onGameStateChange,
}: {
  onGameStateChange?: (state: GameState | null) => void;
}) {
  const [chess_game, set_chess_game] = useState(new Chess());

  const gameState = useGameEvents();

  const localTimeLeft = useGameTimer(gameState);

  useEffect(() => {
    if (gameState) {
      if (gameState.fen) {
        set_chess_game(new Chess(gameState.fen));
      }

      if (gameState.type === "error" && gameState.message) {
        alert(gameState.message);
      }
    }
  }, [gameState]);

  // Add time formatting helper
  const formatTime = (ms: number) => {
    if (ms === undefined) return "0:00";

    // Convert milliseconds to seconds
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(Math.abs(totalSeconds) / 60);
    const seconds = Math.abs(totalSeconds) % 60;

    const sign = totalSeconds < 0 ? "-" : "";

    return `${sign}${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Add this helper function near your other helpers
  const getLastMoveSquares = (lastMove: string | null | undefined) => {
    if (!lastMove) return {};

    const from = lastMove.slice(0, 2);
    const to = lastMove.slice(2, 4);

    return {
      [from]: { backgroundColor: "rgba(255, 255, 0, 0.3)" },
      [to]: { backgroundColor: "rgba(255, 255, 0, 0.3)" },
    };
  };

  // Update the board configuration with animation settings
  const boardConfig = {
    position: chess_game.fen(),
    onPieceDrop: on_drop,
    boardWidth: 500,
    boardOrientation: gameState?.playerColor || "white",
    customDarkSquareStyle: { backgroundColor: "#779952" },
    customLightSquareStyle: { backgroundColor: "#edeed1" },
    customBoardStyle: {
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
    },
    animationDuration: 300,
    transitionDuration: 300,
    showBoardNotation: true,
    arePiecesDraggable: true,
    animationSettings: {
      enabled: true,
      duration: 300,
      timingFunction: "ease-in-out",
    },
    customSquareStyles: {
      ...(chess_game.inCheck()
        ? {
            ...Object.fromEntries(
              chess_game.board().flatMap((row, i) =>
                row
                  .map(
                    (
                      piece,
                      j
                    ): [string, { backgroundColor: string }] | null => {
                      if (
                        piece &&
                        piece.type === "k" &&
                        piece.color === chess_game.turn()
                      ) {
                        const square = `${String.fromCharCode(97 + j)}${8 - i}`;
                        return [
                          square,
                          { backgroundColor: "rgba(255, 0, 0, 0.5)" },
                        ];
                      }
                      return null;
                    }
                  )
                  .filter(
                    (x): x is [string, { backgroundColor: string }] =>
                      x !== null
                  )
              )
            ),
          }
        : {}),
      ...getLastMoveSquares(gameState?.lastMove),
    },
  };

  // Optimize state updates for game position
  useEffect(() => {
    if (gameState?.fen) {
      // Add a small delay to allow for smooth transitions
      setTimeout(() => {
        const newGame = new Chess(gameState.fen);
        set_chess_game(newGame);
      }, 50);
    }
  }, [gameState?.fen]);

  // Optimize the drop handler
  function on_drop(source_square: string, target_square: string) {
    try {
      const move = chess_game.move({
        from: source_square,
        to: target_square,
        promotion: "q",
      });

      if (move) {
        // Don't create a new Chess instance immediately
        // Let the animation complete first
        setTimeout(() => {
          set_chess_game(new Chess(chess_game.fen()));
        }, 300); // Match the animation duration

        return true;
      }
    } catch (error) {
      console.error("Error making move:", error);
    }
    return false;
  }

  // Add helper to get player names based on color
  const getPlayerName = (color: "white" | "black") => {
    if (!gameState) return "...";
    return gameState.botColor === color ? "Bot" : "Opponent";
  };

  // Add helper to get player ratings
  const getPlayerRating = (color: "white" | "black") => {
    return gameState?.ratings[color] ?? "?";
  };

  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackSpeedMs = 1000; // 1 second per move

  // Add playback functionality
  useEffect(() => {
    let playbackTimer: NodeJS.Timeout;

    if (isPlaying && currentMoveIndex < moveHistory.length - 1) {
      playbackTimer = setTimeout(() => {
        goToNextMove();
      }, playbackSpeedMs);
    } else if (currentMoveIndex >= moveHistory.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (playbackTimer) {
        clearTimeout(playbackTimer);
      }
    };
  }, [isPlaying, currentMoveIndex, moveHistory]);

  // Update useEffect to track moves
  useEffect(() => {
    if (gameState?.lastMove && !moveHistory.includes(gameState.lastMove)) {
      setMoveHistory((prev) => [...prev, gameState.lastMove!]);
      setCurrentMoveIndex((prev) => prev + 1);
    }
  }, [gameState?.lastMove]);

  // Update navigation functions
  const goToMove = (index: number) => {
    const game = new Chess();
    for (let i = 0; i <= index; i++) {
      try {
        const uciMove = moveHistory[i];
        if (uciMove) {
          console.log("Attempting move:", uciMove);

          // Get all legal moves in current position
          const legalMoves = game.moves({ verbose: true });
          console.log("Legal moves:", legalMoves);

          // Find matching legal move
          const move = legalMoves.find(
            (m) => m.from + m.to + (m.promotion || "") === uciMove
          );

          if (move) {
            game.move(move);
          } else {
            console.error("No legal move found matching:", uciMove);
          }
        }
      } catch (error) {
        console.error("Invalid move:", moveHistory[i], error);
      }
    }
    set_chess_game(game);
    setCurrentMoveIndex(index);
  };

  const goToNextMove = () => {
    if (currentMoveIndex < moveHistory.length - 1) {
      goToMove(currentMoveIndex + 1);
    }
  };

  // Update the formatAdvantage helper function
  const formatAdvantage = (advantage: number | undefined) => {
    if (advantage === undefined) return "";
    // For black's advantage (negative numbers), show the absolute value
    const absoluteAdvantage = Math.abs(advantage);
    return `+${absoluteAdvantage}`;
  };

  // Add this effect to propagate gameState changes
  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange(gameState);
    }
  }, [gameState, onGameStateChange]);

  return (
    <div className="flex gap-6">
      <div className="flex">
        <div className="space-y-6">
          <Chessboard {...boardConfig} />
        </div>
      </div>

      <div className="w-80 bg-white/5 rounded-lg overflow-hidden">
        {/* Top player (always opponent) */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  gameState?.botColor === "black" ? "bg-white" : "bg-black"
                } border border-white/30`}
              />
              <span className="text-gray-200 font-semibold">
                {getPlayerName(
                  gameState?.botColor === "black" ? "white" : "black"
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono text-gray-300">
                {formatTime(
                  gameState?.botColor === "black"
                    ? localTimeLeft.white
                    : localTimeLeft.black
                )}
              </span>
              <span className="text-gray-400">
                {getPlayerRating(
                  gameState?.botColor === "black" ? "white" : "black"
                )}
              </span>
              {gameState?.positionAdvantage &&
                ((gameState.botColor === "black" &&
                  gameState.positionAdvantage > 0) ||
                  (gameState.botColor === "white" &&
                    gameState.positionAdvantage < 0)) && (
                  <span className="text-gray-300 font-mono">
                    {formatAdvantage(gameState.positionAdvantage)}
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Add chat section in the move list area */}
        <div className="h-[300px] overflow-y-auto border-b border-white/10 p-4">
          <div className="space-y-2">
            {gameState?.chatMessages?.map((message, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">
                    {message.username}:
                  </span>
                  <span className="text-gray-200">{message.text}</span>
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(message.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  gameState?.botColor === "black" ? "bg-black" : "bg-white"
                } border border-white/30`}
              />
              <span className="text-gray-200 font-semibold">
                {getPlayerName(gameState?.botColor ?? "white")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono text-gray-300">
                {formatTime(
                  gameState?.botColor === "black"
                    ? localTimeLeft.black
                    : localTimeLeft.white
                )}
              </span>
              <span className="text-gray-400">
                {getPlayerRating(gameState?.botColor ?? "white")}
              </span>
              {gameState?.positionAdvantage &&
                ((gameState.botColor === "black" &&
                  gameState.positionAdvantage < 0) ||
                  (gameState.botColor === "white" &&
                    gameState.positionAdvantage > 0)) && (
                  <span className="text-gray-300 font-mono">
                    {formatAdvantage(gameState.positionAdvantage)}
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
