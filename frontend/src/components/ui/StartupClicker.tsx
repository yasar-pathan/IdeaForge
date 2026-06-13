'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// =============================================
// GAME HUB — Renders selection or active game
// =============================================

export function StartupClicker() {
  const [activeGame, setActiveGame] = useState<'hub' | 'tictactoe' | 'memory' | 'snake'>('hub');

  return (
    <div className="w-full rounded-2xl border border-[var(--border-bright)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e38_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.07] pointer-events-none" />

      <AnimatePresence mode="wait">
        {activeGame === 'hub' && (
          <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10">
            <GameHub onSelect={setActiveGame} />
          </motion.div>
        )}
        {activeGame === 'tictactoe' && (
          <motion.div key="ttt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-10">
            <TicTacToe onBack={() => setActiveGame('hub')} />
          </motion.div>
        )}
        {activeGame === 'memory' && (
          <motion.div key="mem" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-10">
            <MemoryMatch onBack={() => setActiveGame('hub')} />
          </motion.div>
        )}
        {activeGame === 'snake' && (
          <motion.div key="snk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-10">
            <SnakeGame onBack={() => setActiveGame('hub')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================
// GAME HUB SELECTION SCREEN
// =============================================

function GameHub({ onSelect }: { onSelect: (g: 'tictactoe' | 'memory' | 'snake') => void }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Gamepad2 className="h-5 w-5 text-[var(--accent-primary)]" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[var(--text-primary)]">
          Play while you wait
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'tictactoe' as const, emoji: '❌⭕', title: 'Tic Tac Toe', sub: 'Beat the AI' },
          { id: 'memory' as const, emoji: '🧠', title: 'Memory Match', sub: 'Flip & match pairs' },
          { id: 'snake' as const, emoji: '🐍', title: 'Snake', sub: 'Classic arcade' },
        ].map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3 cursor-pointer transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-95"
          >
            <span className="text-2xl">{g.emoji}</span>
            <span className="text-[11px] font-bold text-[var(--text-primary)]">{g.title}</span>
            <span className="text-[9px] text-[var(--text-muted)]">{g.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================
// GAME 1: TIC TAC TOE vs MINIMAX AI
// =============================================

type TTTBoard = (string | null)[];

function checkWinner(b: TTTBoard): { winner: string | null; line: number[] | null } {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b2, c] of lines) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) {
      return { winner: b[a], line: [a, b2, c] };
    }
  }
  return { winner: null, line: null };
}

function minimax(board: TTTBoard, isMax: boolean): number {
  const { winner } = checkWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (board.every((c) => c !== null)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board: TTTBoard): number {
  // Add slight randomness on first move so AI isn't always perfect
  const empty = board.filter((c) => c === null).length;
  if (empty >= 8 && Math.random() > 0.5) {
    const corners = [0, 2, 6, 8].filter((i) => !board[i]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  }

  let bestVal = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const val = minimax(board, false);
      board[i] = null;
      if (val > bestVal) {
        bestVal = val;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function TicTacToe({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<TTTBoard>(Array(9).fill(null));
  const [gameOver, setGameOver] = useState(false);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [message, setMessage] = useState("Your turn — you're X");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ideaforge_ttt_stats');
      if (saved) setStats(JSON.parse(saved));
    }
  }, []);

  const saveStats = (s: typeof stats) => {
    setStats(s);
    localStorage.setItem('ideaforge_ttt_stats', JSON.stringify(s));
  };

  const handleClick = (idx: number) => {
    if (board[idx] || gameOver) return;
    const next = [...board];
    next[idx] = 'X';
    setBoard(next);

    const result = checkWinner(next);
    if (result.winner) {
      setWinLine(result.line);
      setGameOver(true);
      setMessage('You won! 🎉');
      saveStats({ ...stats, wins: stats.wins + 1 });
      return;
    }
    if (next.every((c) => c !== null)) {
      setGameOver(true);
      setMessage("It's a draw!");
      saveStats({ ...stats, draws: stats.draws + 1 });
      return;
    }

    setMessage('AI is thinking...');
    // Small delay for AI "thinking" feel
    setTimeout(() => {
      const aiMove = getBestMove([...next]);
      if (aiMove >= 0) {
        next[aiMove] = 'O';
        setBoard([...next]);
        const aiResult = checkWinner(next);
        if (aiResult.winner) {
          setWinLine(aiResult.line);
          setGameOver(true);
          setMessage('AI wins! Try again');
          saveStats({ ...stats, losses: stats.losses + 1 });
        } else if (next.every((c) => c !== null)) {
          setGameOver(true);
          setMessage("It's a draw!");
          saveStats({ ...stats, draws: stats.draws + 1 });
        } else {
          setMessage("Your turn — you're X");
        }
      }
    }, 300);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinLine(null);
    setMessage("Your turn — you're X");
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">← Back</button>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-[var(--success)]">W:{stats.wins}</span>
          <span className="text-[var(--danger)]">L:{stats.losses}</span>
          <span className="text-[var(--text-muted)]">D:{stats.draws}</span>
        </div>
        <button onClick={reset} className="p-1.5 rounded-lg border border-[var(--border-bright)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>

      <p className="text-center text-xs text-[var(--text-secondary)] mb-3">{message}</p>

      <div className="grid grid-cols-3 gap-2 w-[210px] mx-auto">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            disabled={!!cell || gameOver}
            className={`h-[66px] w-[66px] rounded-xl border-2 text-2xl font-black flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-90 select-none ${
              winLine?.includes(idx)
                ? 'border-[var(--success)] bg-[var(--success-bg)] shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : cell
                ? 'border-[var(--border-bright)] bg-[var(--bg-elevated)]'
                : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            {cell === 'X' && <span className="text-[var(--accent-primary)]">✕</span>}
            {cell === 'O' && <span className="text-[var(--danger)]">◯</span>}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="mt-4 text-center">
          <button onClick={reset} className="text-xs font-bold text-[var(--accent-primary)] hover:underline cursor-pointer">
            Play again →
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================
// GAME 2: MEMORY CARD MATCH
// =============================================

const MEMORY_ICONS = ['🚀', '💡', '⚡', '🎯', '🔥', '💎', '🦄', '🧠'];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MemoryMatch({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const lockRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBestScore(Number(localStorage.getItem('ideaforge_memory_best') || 0));
    }
    initGame();
  }, []);

  const initGame = () => {
    setCards(shuffleArray([...MEMORY_ICONS, ...MEMORY_ICONS]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    lockRef.current = false;
  };

  const handleFlip = (idx: number) => {
    if (lockRef.current || flipped.includes(idx) || matched.includes(idx)) return;

    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      lockRef.current = true;

      if (cards[next[0]] === cards[next[1]]) {
        // Match found
        setTimeout(() => {
          setMatched((prev) => [...prev, next[0], next[1]]);
          setFlipped([]);
          lockRef.current = false;

          // Check win (16 cards = 8 pairs = 16 matched)
          const totalMatched = matched.length + 2;
          if (totalMatched === 16) {
            const finalMoves = moves + 1;
            if (bestScore === 0 || finalMoves < bestScore) {
              setBestScore(finalMoves);
              localStorage.setItem('ideaforge_memory_best', String(finalMoves));
            }
            toast.success(`🎉 All matched in ${finalMoves} moves!`);
          }
        }, 400);
      } else {
        // No match — flip back
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 800);
      }
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">← Back</button>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-[var(--text-primary)]">Moves: {moves}</span>
          {bestScore > 0 && <span className="text-[var(--success)]">Best: {bestScore}</span>}
        </div>
        <button onClick={initGame} className="p-1.5 rounded-lg border border-[var(--border-bright)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>

      <div className="grid grid-cols-4 gap-2 max-w-[260px] mx-auto">
        {cards.map((icon, idx) => {
          const isFlipped = flipped.includes(idx);
          const isMatched = matched.includes(idx);
          const showFace = isFlipped || isMatched;

          return (
            <button
              key={idx}
              onClick={() => handleFlip(idx)}
              className={`h-[56px] w-[56px] rounded-xl border-2 text-xl flex items-center justify-center cursor-pointer transition-all duration-200 select-none active:scale-90 ${
                isMatched
                  ? 'border-[var(--success)]/40 bg-[var(--success-bg)] scale-95 opacity-60'
                  : isFlipped
                  ? 'border-[var(--accent-primary)] bg-[var(--bg-elevated)] shadow-[0_0_10px_var(--accent-glow)]'
                  : 'border-[var(--border)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-elevated)] hover:border-[var(--accent-primary)] hover:shadow-[0_0_8px_var(--accent-glow)]'
              }`}
            >
              {showFace ? (
                <motion.span initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.2 }}>
                  {icon}
                </motion.span>
              ) : (
                <span className="text-[var(--text-muted)] text-xs font-bold">?</span>
              )}
            </button>
          );
        })}
      </div>

      {matched.length === 16 && (
        <div className="mt-4 text-center">
          <button onClick={initGame} className="text-xs font-bold text-[var(--accent-primary)] hover:underline cursor-pointer">
            Play again →
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================
// GAME 3: SNAKE
// =============================================

const GRID_SIZE = 15;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

function SnakeGame({ onBack }: { onBack: () => void }) {
  const [snake, setSnake] = useState<Point[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Point>({ x: 3, y: 3 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const dirRef = useRef<Direction>('RIGHT');
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHighScore(Number(localStorage.getItem('ideaforge_snake_best') || 0));
    }
  }, []);

  const spawnFood = useCallback((currentSnake: Point[]): Point => {
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const startGame = () => {
    const initialSnake = [{ x: 7, y: 7 }];
    const initialFood = spawnFood(initialSnake);
    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setFood(initialFood);
    foodRef.current = initialFood;
    setDirection('RIGHT');
    dirRef.current = 'RIGHT';
    setScore(0);
    setIsDead(false);
    setIsPlaying(true);
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      const currentSnake = snakeRef.current;
      const currentFood = foodRef.current;
      const dir = dirRef.current;

      const head = { ...currentSnake[0] };
      if (dir === 'UP') head.y -= 1;
      if (dir === 'DOWN') head.y += 1;
      if (dir === 'LEFT') head.x -= 1;
      if (dir === 'RIGHT') head.x += 1;

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setIsPlaying(false);
        setIsDead(true);
        const finalScore = currentSnake.length - 1;
        if (finalScore > Number(localStorage.getItem('ideaforge_snake_best') || 0)) {
          setHighScore(finalScore);
          localStorage.setItem('ideaforge_snake_best', String(finalScore));
        }
        return;
      }

      // Self collision
      if (currentSnake.some((s) => s.x === head.x && s.y === head.y)) {
        setIsPlaying(false);
        setIsDead(true);
        const finalScore = currentSnake.length - 1;
        if (finalScore > Number(localStorage.getItem('ideaforge_snake_best') || 0)) {
          setHighScore(finalScore);
          localStorage.setItem('ideaforge_snake_best', String(finalScore));
        }
        return;
      }

      const newSnake = [head, ...currentSnake];

      // Eating food
      if (head.x === currentFood.x && head.y === currentFood.y) {
        const newFood = spawnFood(newSnake);
        setFood(newFood);
        foodRef.current = newFood;
        setScore(newSnake.length - 1);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
      snakeRef.current = newSnake;
    };

    gameLoopRef.current = setInterval(tick, INITIAL_SPEED);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, spawnFood]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const d = dirRef.current;
      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && d !== 'DOWN') {
        e.preventDefault();
        dirRef.current = 'UP';
        setDirection('UP');
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && d !== 'UP') {
        e.preventDefault();
        dirRef.current = 'DOWN';
        setDirection('DOWN');
      } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && d !== 'RIGHT') {
        e.preventDefault();
        dirRef.current = 'LEFT';
        setDirection('LEFT');
      } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && d !== 'LEFT') {
        e.preventDefault();
        dirRef.current = 'RIGHT';
        setDirection('RIGHT');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const changeDir = (d: Direction) => {
    const cur = dirRef.current;
    if (d === 'UP' && cur !== 'DOWN') { dirRef.current = d; setDirection(d); }
    if (d === 'DOWN' && cur !== 'UP') { dirRef.current = d; setDirection(d); }
    if (d === 'LEFT' && cur !== 'RIGHT') { dirRef.current = d; setDirection(d); }
    if (d === 'RIGHT' && cur !== 'LEFT') { dirRef.current = d; setDirection(d); }
  };

  const cellSize = `${100 / GRID_SIZE}%`;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">← Back</button>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-[var(--text-primary)]">Score: {score}</span>
          <span className="text-[var(--success)]">Best: {highScore}</span>
        </div>
        <button onClick={startGame} className="p-1.5 rounded-lg border border-[var(--border-bright)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>

      {/* Snake Grid */}
      <div className="relative w-[270px] h-[270px] mx-auto rounded-xl border-2 border-[var(--border-bright)] bg-[var(--bg-secondary)] overflow-hidden">
        {/* Food */}
        <div
          className="absolute rounded-full bg-[var(--danger)] shadow-[0_0_8px_var(--danger)] transition-all duration-100"
          style={{
            width: cellSize,
            height: cellSize,
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
          }}
        />

        {/* Snake segments */}
        {snake.map((seg, i) => (
          <div
            key={i}
            className={`absolute rounded-sm transition-all duration-75 ${
              i === 0
                ? 'bg-[var(--accent-primary)] shadow-[0_0_6px_var(--accent-primary)] z-10'
                : 'bg-[var(--accent-primary)]/70'
            }`}
            style={{
              width: cellSize,
              height: cellSize,
              left: `${(seg.x / GRID_SIZE) * 100}%`,
              top: `${(seg.y / GRID_SIZE) * 100}%`,
            }}
          />
        ))}

        {/* Start / Game Over overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
            {isDead ? (
              <>
                <p className="text-sm font-bold text-[var(--danger)]">Game Over!</p>
                <p className="text-xs text-[var(--text-secondary)]">Score: {score}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-[var(--text-primary)]">🐍 Snake</p>
            )}
            <button
              onClick={startGame}
              className="mt-1 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] cursor-pointer transition-all active:scale-95"
            >
              {isDead ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-1.5 mt-3 w-28 mx-auto md:hidden">
        <div />
        <button onClick={() => changeDir('UP')} className="bg-[var(--bg-elevated)] active:bg-[var(--border-bright)] border border-[var(--border)] rounded-lg py-2 text-center text-xs font-bold cursor-pointer select-none">▲</button>
        <div />
        <button onClick={() => changeDir('LEFT')} className="bg-[var(--bg-elevated)] active:bg-[var(--border-bright)] border border-[var(--border)] rounded-lg py-2 text-center text-xs font-bold cursor-pointer select-none">◀</button>
        <button onClick={() => changeDir('DOWN')} className="bg-[var(--bg-elevated)] active:bg-[var(--border-bright)] border border-[var(--border)] rounded-lg py-2 text-center text-xs font-bold cursor-pointer select-none">▼</button>
        <button onClick={() => changeDir('RIGHT')} className="bg-[var(--bg-elevated)] active:bg-[var(--border-bright)] border border-[var(--border)] rounded-lg py-2 text-center text-xs font-bold cursor-pointer select-none">▶</button>
      </div>

      <p className="mt-2 text-center text-[9px] text-[var(--text-muted)] hidden md:block">Arrow keys or WASD to move</p>
    </div>
  );
}
