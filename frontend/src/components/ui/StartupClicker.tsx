'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, RotateCcw, HelpCircle, Trophy, Keyboard, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// GAME 1: 2048 MECHANICS
// ==========================================

function transpose(board: number[][]): number[][] {
  return board[0].map((_, colIdx) => board.map(row => row[colIdx]));
}

function reverseRows(board: number[][]): number[][] {
  return board.map(row => [...row].reverse());
}

function slideRowLeft(row: number[]): { newRow: number[]; scoreGained: number } {
  const arr = row.filter(val => val !== 0);
  const newRow: number[] = [];
  let scoreGained = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === arr[i + 1]) {
      newRow.push(arr[i] * 2);
      scoreGained += arr[i] * 2;
      i++;
    } else {
      newRow.push(arr[i]);
    }
  }

  while (newRow.length < 4) {
    newRow.push(0);
  }

  return { newRow, scoreGained };
}

function isGameOver2048(board: number[][]): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
    }
  }
  return true;
}

// ==========================================
// GAME 2: WORDLE MECHANICS
// ==========================================

const TECH_WORDS = [
  'PIVOT', 'SCALE', 'PITCH', 'ROUND', 'STAKE', 'FUNDS', 'AGENT', 'TOKEN',
  'BUILD', 'ASSET', 'CLOUD', 'MODEL', 'VALUE', 'BOARD', 'ROAST', 'SHARE',
  'SALES', 'MERGE', 'EQUITY', 'DEBTS', 'USERS', 'GROWTH', 'CACHE', 'CLICK'
];

// ==========================================
// MAIN COMPONENT & HUB
// ==========================================

export function StartupClicker() {
  const [activeGame, setActiveGame] = useState<'hub' | '2048' | 'wordle'>('hub');

  // Global Highscores
  const [best2048, setBest2048] = useState(0);
  const [wordleWins, setWordleWins] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBest2048(Number(localStorage.getItem('ideaforge_2048_best') || 0));
      setWordleWins(Number(localStorage.getItem('ideaforge_wordle_wins') || 0));
    }
  }, []);

  // ------------------------------------------
  // 2048 STATE & EFFECTS
  // ------------------------------------------
  const [board, setBoard] = useState<number[][]>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [score2048, setScore2048] = useState(0);
  const [gameEnded2048, setGameEnded2048] = useState(false);

  const initGame2048 = () => {
    let newBoard = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    newBoard = spawnRandomTile(newBoard);
    newBoard = spawnRandomTile(newBoard);
    setBoard(newBoard);
    setScore2048(0);
    setGameEnded2048(false);
  };

  const spawnRandomTile = (currentBoard: number[][]): number[][] => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() > 0.1 ? 2 : 4;
    const nextBoard = currentBoard.map(row => [...row]);
    nextBoard[r][c] = val;
    return nextBoard;
  };

  const handle2048Move = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameEnded2048) return;

    let moved = false;
    let scoreGained = 0;
    let nextBoard: number[][] = [];

    if (direction === 'left') {
      nextBoard = board.map(row => {
        const { newRow, scoreGained: sg } = slideRowLeft(row);
        if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
        scoreGained += sg;
        return newRow;
      });
    } else if (direction === 'right') {
      const reversed = reverseRows(board);
      const slided = reversed.map(row => {
        const { newRow, scoreGained: sg } = slideRowLeft(row);
        scoreGained += sg;
        return newRow;
      });
      nextBoard = reverseRows(slided);
      if (JSON.stringify(nextBoard) !== JSON.stringify(board)) moved = true;
    } else if (direction === 'up') {
      const transposed = transpose(board);
      const slided = transposed.map(row => {
        const { newRow, scoreGained: sg } = slideRowLeft(row);
        scoreGained += sg;
        return newRow;
      });
      nextBoard = transpose(slided);
      if (JSON.stringify(nextBoard) !== JSON.stringify(board)) moved = true;
    } else if (direction === 'down') {
      const transposed = transpose(board);
      const reversed = reverseRows(transposed);
      const slided = reversed.map(row => {
        const { newRow, scoreGained: sg } = slideRowLeft(row);
        scoreGained += sg;
        return newRow;
      });
      const unReversed = reverseRows(slided);
      nextBoard = transpose(unReversed);
      if (JSON.stringify(nextBoard) !== JSON.stringify(board)) moved = true;
    }

    if (moved) {
      const boardWithNewTile = spawnRandomTile(nextBoard);
      setBoard(boardWithNewTile);
      const newScore = score2048 + scoreGained;
      setScore2048(newScore);

      if (newScore > best2048) {
        setBest2048(newScore);
        localStorage.setItem('ideaforge_2048_best', String(newScore));
      }

      if (isGameOver2048(boardWithNewTile)) {
        setGameEnded2048(true);
        toast.error('Game Over! No moves left.');
      }
    }
  };

  // Keyboard handler for 2048
  useEffect(() => {
    if (activeGame !== '2048') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handle2048Move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handle2048Move('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handle2048Move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handle2048Move('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame, board, score2048, gameEnded2048]);

  // ------------------------------------------
  // WORDLE STATE & EFFECTS
  // ------------------------------------------
  const [secretWord, setSecretWord] = useState('');
  const [wordleBoard, setWordleBoard] = useState<string[]>(Array(6).fill(''));
  const [currentRow, setCurrentRow] = useState(0);
  const [wordleStatus, setWordleStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const initWordle = () => {
    const word = TECH_WORDS[Math.floor(Math.random() * TECH_WORDS.length)];
    setSecretWord(word);
    setWordleBoard(Array(6).fill(''));
    setCurrentRow(0);
    setWordleStatus('playing');
  };

  const handleWordleKeyPress = (key: string) => {
    if (wordleStatus !== 'playing') return;

    const currentGuess = wordleBoard[currentRow];

    if (key === 'ENTER') {
      if (currentGuess.length < 5) {
        toast.warning('Word too short!');
        return;
      }

      // Check win or lose
      if (currentGuess === secretWord) {
        setWordleStatus('won');
        const nextWins = wordleWins + 1;
        setWordleWins(nextWins);
        localStorage.setItem('ideaforge_wordle_wins', String(nextWins));
        toast.success(`🎉 Brilliant! You guessed it in ${currentRow + 1} tries!`);
      } else if (currentRow === 5) {
        setWordleStatus('lost');
        toast.error(`Game Over! The word was ${secretWord}`);
      } else {
        setCurrentRow(prev => prev + 1);
      }
    } else if (key === 'BACKSPACE') {
      setWordleBoard(prev => {
        const next = [...prev];
        next[currentRow] = currentGuess.slice(0, -1);
        return next;
      });
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setWordleBoard(prev => {
        const next = [...prev];
        next[currentRow] = currentGuess + key;
        return next;
      });
    }
  };

  // Keyboard handler for Wordle
  useEffect(() => {
    if (activeGame !== 'wordle') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE') {
        e.preventDefault();
        handleWordleKeyPress(key);
      } else if (/^[A-Z]$/.test(key)) {
        handleWordleKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame, wordleBoard, currentRow, wordleStatus, secretWord]);

  // Color mapping helper for Wordle letter grid cell
  const getCellColor = (rowIdx: number, charIdx: number, char: string) => {
    if (rowIdx >= currentRow) return 'border-[var(--border)] bg-transparent text-[var(--text-primary)]';
    
    // Evaluated rows
    const secretLetters = secretWord.split('');
    const charUpper = char.toUpperCase();

    if (secretWord[charIdx] === charUpper) {
      return 'border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)] font-bold';
    }

    if (secretLetters.includes(charUpper)) {
      return 'border-[var(--warning)] bg-[var(--warning-bg)] text-[var(--warning)] font-bold';
    }

    return 'border-[var(--border-bright)] bg-[var(--bg-elevated)] text-[var(--text-muted)]';
  };

  return (
    <div className="w-full flex flex-col gap-4 rounded-2xl border border-[var(--border-bright)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e38_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

      {/* GAME ARCADE HUB SCREEN */}
      {activeGame === 'hub' && (
        <div className="text-center py-6 z-10 flex flex-col items-center">
          <Gamepad2 className="h-12 w-12 text-[var(--accent-primary)] mb-3 animate-bounce" />
          <h2 className="font-display text-lg font-black tracking-wide uppercase text-[var(--text-primary)]">
            IdeaForge Arcade
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
            Play classic, professional games while the AI model builds your startup components.
          </p>

          {/* Game Selection Cards */}
          <div className="grid grid-cols-2 gap-4 w-full mt-8 max-w-md">
            {/* 2048 Card */}
            <button
              onClick={() => {
                setActiveGame('2048');
                initGame2048();
              }}
              className="flex flex-col items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-center cursor-pointer transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-1"
            >
              <div className="text-3xl font-extrabold text-[#7C6EFA]">2048</div>
              <div className="mt-3">
                <span className="text-xs font-bold text-[var(--text-primary)]">Slide & Merge</span>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Combine tiles to reach 2048</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span>Best: {best2048}</span>
              </div>
            </button>

            {/* Wordle Card */}
            <button
              onClick={() => {
                setActiveGame('wordle');
                initWordle();
              }}
              className="flex flex-col items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-center cursor-pointer transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-1"
            >
              <div className="text-3xl font-bold text-[#A855F7] tracking-wider font-mono">W-O-R-D</div>
              <div className="mt-3">
                <span className="text-xs font-bold text-[var(--text-primary)]">Tech Wordle</span>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Guess startup-themed words</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span>Wins: {wordleWins}</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 2048 GAMEPLAY */}
      {activeGame === '2048' && (
        <div className="flex flex-col items-center z-10">
          <div className="flex w-full items-center justify-between border-b border-[var(--border)] pb-3.5 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveGame('hub')}
                className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ← Arcade Hub
              </button>
              <span className="text-xs font-bold text-[var(--text-primary)]">/ 2048 Puzzle</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] text-[var(--text-muted)]">SCORE</p>
                <p className="text-xs font-mono font-bold text-[var(--success)]">{score2048}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-[var(--text-muted)]">BEST</p>
                <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{best2048}</p>
              </div>
              <button
                onClick={initGame2048}
                className="rounded-lg p-1.5 border border-[var(--border-bright)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition"
                title="Restart"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 2048 Board */}
          <div className="relative p-2 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] w-[280px] h-[280px] grid grid-cols-4 grid-rows-4 gap-2">
            {board.map((row, rIdx) =>
              row.map((val, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`flex items-center justify-center rounded-xl text-lg font-black transition-all duration-100 select-none ${
                    val === 0
                      ? 'bg-[var(--bg-elevated)]/40 opacity-40'
                      : val === 2
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                      : val === 4
                      ? 'bg-[var(--border-bright)] text-[var(--text-primary)]'
                      : val === 8
                      ? 'bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#EAB308]'
                      : val === 16
                      ? 'bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316]'
                      : val === 32
                      ? 'bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444]'
                      : val === 64
                      ? 'bg-[#EC4899]/20 border border-[#EC4899]/40 text-[#EC4899]'
                      : val === 128
                      ? 'bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7]'
                      : val === 256
                      ? 'bg-[#6366F1]/20 border border-[#6366F1]/40 text-[#6366F1]'
                      : val === 512
                      ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#3B82F6]'
                      : val === 1024
                      ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]'
                      : 'bg-[#7C6EFA] text-[var(--text-primary)] shadow-[0_0_15px_rgba(124,110,250,0.5)]'
                  }`}
                >
                  {val > 0 ? val : ''}
                </div>
              ))
            )}

            {gameEnded2048 && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4">
                <AlertCircle className="h-10 w-10 text-[var(--danger)] mb-2 animate-pulse" />
                <h4 className="font-bold text-[var(--text-primary)]">Game Over</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Final Score: {score2048}</p>
                <button
                  type="button"
                  className="mt-4 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] cursor-pointer transition-all duration-150 active:scale-95"
                  onClick={initGame2048}
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col items-center text-[10px] text-[var(--text-secondary)] leading-relaxed">
            <div className="flex items-center gap-1">
              <Keyboard className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
              <span>Use <strong>Arrow keys</strong> or <strong>WASD</strong> to play</span>
            </div>
            {/* Virtual Controls for Mobile */}
            <div className="grid grid-cols-3 gap-1.5 mt-3.5 w-32 md:hidden">
              <div />
              <button onClick={() => handle2048Move('up')} className="bg-[var(--bg-elevated)] active:bg-[var(--border-bright)] border border-[var(--border)] rounded-lg py-2 text-center text-xs font-bold">▲</button>
              <div />
              <button onClick={() => handle2048Move('left')} className="bg-[var(--bg-elevated)] active:bg-[var(--border-bright)] border border-[var(--border)] rounded-lg py-2 text-center text-xs font-bold">◀</button>
              <button onClick={() => handle2048Move('down')} className="bg-[var(--bg-elevated)] active:bg-[var(--border-bright)] border border-[var(--border)] rounded-lg py-2 text-center text-xs font-bold">▼</button>
              <button onClick={() => handle2048Move('right')} className="bg-[var(--bg-elevated)] active:bg-[var(--border-bright)] border border-[var(--border)] rounded-lg py-2 text-center text-xs font-bold">▶</button>
            </div>
          </div>
        </div>
      )}

      {/* WORDLE GAMEPLAY */}
      {activeGame === 'wordle' && (
        <div className="flex flex-col items-center z-10">
          <div className="flex w-full items-center justify-between border-b border-[var(--border)] pb-3.5 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveGame('hub')}
                className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ← Arcade Hub
              </button>
              <span className="text-xs font-bold text-[var(--text-primary)]">/ Tech Wordle</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-secondary)]">Wins: {wordleWins}</span>
              <button
                onClick={initWordle}
                className="rounded-lg p-1.5 border border-[var(--border-bright)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition"
                title="Restart"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Wordle Rows */}
          <div className="flex flex-col gap-1.5 mb-5 select-none">
            {wordleBoard.map((rowText, rIdx) => {
              const paddedRow = rowText.padEnd(5, ' ');
              return (
                <div key={rIdx} className="flex gap-1.5">
                  {paddedRow.split('').map((char, cIdx) => (
                    <div
                      key={cIdx}
                      className={`h-11 w-11 flex items-center justify-center rounded-xl border-2 text-lg font-black uppercase transition-all duration-300 ${getCellColor(
                        rIdx,
                        cIdx,
                        char
                      )}`}
                    >
                      {char !== ' ' ? char : ''}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* virtual Keyboard Panel */}
          <div className="w-full max-w-sm flex flex-col gap-1">
            {[
              ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
              ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
              ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
            ].map((rowKeys, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1">
                {rowKeys.map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleWordleKeyPress(key)}
                    className={`h-9 items-center justify-center rounded-lg font-mono font-bold text-xs cursor-pointer transition-colors active:bg-[var(--border-bright)] select-none ${
                      key === 'ENTER' || key === 'BACKSPACE'
                        ? 'px-2 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]'
                        : 'w-7.5 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {key === 'BACKSPACE' ? '⌫' : key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* End status Overlay */}
          {wordleStatus !== 'playing' && (
            <div className="mt-4 flex flex-col items-center bg-[var(--bg-secondary)] border border-[var(--border)] p-3 rounded-xl w-full text-center">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {wordleStatus === 'won' ? '🎉 You Guessed It!' : `😞 Secret word was: ${secretWord}`}
              </p>
              <button
                onClick={initWordle}
                className="mt-2 text-[10px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Play next word →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
