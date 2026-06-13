'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Progress } from '@/frontend/components/ui/Progress';
import { Button } from '@/frontend/components/ui/Button';
import { useSessionStatus } from '@/frontend/hooks/useSessionStatus';
import { ANALYZE_MODULE_CHIPS } from '@/backend/lib/modules';
import { cn } from '@/backend/lib/utils';
import { SmartFactsCarousel } from '@/frontend/components/ui/SmartFactsCarousel';
import { StartupClicker } from '@/frontend/components/ui/StartupClicker';
import { AIThinkingTicker } from '@/frontend/components/ui/AIThinkingTicker';
import { SoundToggleButton } from '@/frontend/components/ui/SoundToggleButton';
import { playChime, playSuccessChime } from '@/frontend/lib/audio';

// Dynamically import Confetti to prevent Next.js SSR window errors
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export function AnalysisProgress({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const doneRef = useRef(false);
  const [slowHint, setSlowHint] = useState(false);
  const {
    status,
    progress,
    completedModules,
    ideaTitle,
    totalModules,
    isLoading,
    error,
  } = useSessionStatus(sessionId);

  const [etaSeconds, setEtaSeconds] = useState(0);
  const [showGames, setShowGames] = useState(false);

  // Auto-show game hub after 8 seconds of processing
  useEffect(() => {
    if (status !== 'processing') { setShowGames(false); return; }
    const t = setTimeout(() => setShowGames(true), 8000);
    return () => clearTimeout(t);
  }, [status]);

  // Sound triggers
  const prevCompletedCount = useRef(completedModules.length);
  const hasPlayedSuccess = useRef(false);

  useEffect(() => {
    if (completedModules.length > prevCompletedCount.current) {
      playChime();
      prevCompletedCount.current = completedModules.length;
    }
  }, [completedModules]);

  useEffect(() => {
    if (status === 'complete' && !hasPlayedSuccess.current) {
      playSuccessChime();
      hasPlayedSuccess.current = true;
    }
  }, [status]);

  // Navigate to results when done
  useEffect(() => {
    if (status !== 'complete' || doneRef.current) return;
    doneRef.current = true;
    const t = setTimeout(() => router.push(`/results/${sessionId}`), 2200); // Give user a moment to enjoy the success state and confetti
    return () => clearTimeout(t);
  }, [status, sessionId, router]);

  // Show slow message if stuck at 0%
  useEffect(() => {
    if (status !== 'processing' || progress > 0) {
      return;
    }
    const t = setTimeout(() => setSlowHint(true), 45_000);
    return () => clearTimeout(t);
  }, [status, progress]);

  // Dynamic ETA calculation
  useEffect(() => {
    const remaining = totalModules - completedModules.length;
    // Estimated ~20s per remaining module
    setEtaSeconds(Math.max(0, remaining * 20));
  }, [completedModules.length, totalModules]);

  // Countdown timer for ETA
  useEffect(() => {
    if (status !== 'processing' || etaSeconds <= 0) return;
    const timer = setInterval(() => {
      setEtaSeconds((prev) => (prev > 3 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [status, etaSeconds]);

  // Find the active module that is currently generating
  const currentModule = ANALYZE_MODULE_CHIPS.find(({ key }) => !completedModules.includes(key))?.key || null;

  const formatETA = (seconds: number) => {
    if (seconds <= 3) return 'Finalizing...';
    if (seconds > 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `~${mins}m ${secs}s remaining`;
    }
    return `~${seconds}s remaining`;
  };

  return (
    <div className="relative z-[1] flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20">
      {/* Confetti celebration */}
      {status === 'complete' && <Confetti recycle={false} numberOfPieces={250} />}

      {/* Floating sound toggle */}
      <div className="absolute right-6 top-24 z-20">
        <SoundToggleButton />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--border-bright)] bg-[var(--bg-card)] shadow-[var(--shadow-glow)]"
      >
        <img src="/icon.png" alt="IdeaForge Logo" className={cn("h-10 w-10 object-contain", status === 'processing' && "animate-pulse")} />
      </motion.div>

      <h1 className="font-display text-center text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        {status === 'complete' ? 'Forge complete!' : 'Forging your idea…'}
      </h1>
      <p className="mt-3 text-center text-[var(--text-secondary)]">
        {ideaTitle ? (
          <span className="text-[var(--text-primary)]">{ideaTitle}</span>
        ) : isLoading ? (
          'Starting engines…'
        ) : (
          'Processing…'
        )}
      </p>

      <div className="mt-10 w-full max-w-xl">
        {status === 'processing' && (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <AIThinkingTicker moduleId={currentModule} />
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {formatETA(etaSeconds)}
            </span>
          </div>
        )}
        <Progress value={progress} showLabel />
        <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
          {completedModules.length} of {totalModules} modules complete
        </p>
      </div>

      {/* Interactive Activity Section */}
      {status === 'processing' && (
        <div className="mt-6 w-full max-w-xl flex flex-col gap-4 slide-up">
          {/* Trivia always visible */}
          <SmartFactsCarousel />

          {/* Game hub auto-appears after 8s */}
          {showGames && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🎮</span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  While you wait — play a quick game
                </span>
              </div>
              <StartupClicker />
            </motion.div>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-[var(--text-muted)] text-center max-w-md">
        Full run usually takes a few minutes (modules run in sequence to optimize API rates).
      </p>

      {slowHint && status === 'processing' && progress === 0 ? (
        <p className="mt-4 max-w-md text-center text-xs text-[var(--warning)]">
          Still at 0%? Confirm{' '}
          <code className="rounded bg-[var(--bg-elevated)] px-1 font-mono text-[10px]">GOOGLE_GENERATIVE_AI_API_KEY</code>{' '}
          in .env.local and restart the dev server. Check the terminal running{' '}
          <code className="font-mono text-[10px]">next dev</code> for errors.
        </p>
      ) : null}

      {error ? (
        <div className="mt-8 max-w-md rounded-xl border border-[var(--danger)]/40 bg-[var(--danger-bg)] p-4 text-center text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      {status === 'failed' ? (
        <Button className="mt-6" variant="secondary" onClick={() => router.push('/')}>
          Try again
        </Button>
      ) : null}

      <div className="mt-12 w-full max-w-4xl">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Modules
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {ANALYZE_MODULE_CHIPS.map(({ key, label }) => {
            const done = completedModules.includes(key);
            const processing = !done && status === 'processing' && currentModule === key;
            return (
              <span
                key={key}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300',
                  done
                    ? 'border-[var(--success)]/40 bg-[var(--success-bg)] text-[var(--success)]'
                    : processing
                      ? 'border-[var(--accent-primary)]/50 bg-[var(--accent-glow)] text-[var(--text-accent)] shadow-[0_0_12px_rgba(124,110,250,0.25)] animate-pulse'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]'
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                ) : processing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent-primary)]" />
                ) : null}
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
