'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Hexagon, Loader2, Check } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { useSessionStatus } from '@/hooks/useSessionStatus';
import { ANALYZE_MODULE_CHIPS } from '@/lib/modules';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    if (status !== 'complete' || doneRef.current) return;
    doneRef.current = true;
    const t = setTimeout(() => router.push(`/results/${sessionId}`), 800);
    return () => clearTimeout(t);
  }, [status, sessionId, router]);

  useEffect(() => {
    if (status !== 'processing' || progress > 0) {
      setSlowHint(false);
      return;
    }
    const t = setTimeout(() => setSlowHint(true), 45_000);
    return () => clearTimeout(t);
  }, [status, progress]);

  return (
    <div className="relative z-[1] flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--border-bright)] bg-[var(--bg-card)] shadow-[var(--shadow-glow)]"
      >
        <Hexagon className="h-10 w-10 animate-pulse text-[var(--accent-primary)]" />
      </motion.div>

      <h1 className="font-display text-center text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        Forging your idea…
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
        <Progress value={progress} showLabel />
        <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
          {completedModules.length} of {totalModules} modules complete
        </p>
      </div>

      <p className="mt-6 text-xs text-[var(--text-muted)]">
        Full run usually takes a few minutes (modules run in sequence to avoid API rate limits).
      </p>

      {slowHint ? (
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
            const processing =
              !done && status === 'processing' && completedModules.length > 0 && key === 'ppt_slides';
            return (
              <span
                key={key}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300',
                  done
                    ? 'border-[var(--success)]/40 bg-[var(--success-bg)] text-[var(--success)] slide-up'
                    : processing
                      ? 'border-[var(--accent-primary)]/50 bg-[var(--accent-glow)] text-[var(--text-accent)]'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
