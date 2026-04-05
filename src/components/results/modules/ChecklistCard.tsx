'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ListChecks } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

type Item = { task?: string; success_signal?: string; time_estimate?: string; phase?: string };

export function ChecklistCard({ data, sessionId }: { data: Record<string, unknown> | null; sessionId: string }) {
  const items = (data?.checklist as Item[]) ?? [];
  const storageKey = `ideaforge-checklist-${sessionId}`;
  const [done, setDone] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw) as number[]));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const total = items.length;
  const count = done.size;
  const pct = total ? (count / total) * 100 : 0;

  useEffect(() => {
    if (total && count === total) {
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 4500);
      return () => clearTimeout(t);
    }
  }, [count, total]);

  if (!mounted) {
    return (
      <section
        id="checklist"
        className="module-card mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
      >
        <div className="h-40 skeleton" />
      </section>
    );
  }

  return (
    <section
      id="checklist"
      className="module-card card-hover relative mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      {confetti && typeof window !== 'undefined' ? (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={220} />
      ) : null}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Validation checklist</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {count} / {total} complete
            </p>
          </div>
        </div>
        {count === total && total > 0 ? (
          <Badge variant="success">Ready to build 🚀</Badge>
        ) : null}
      </div>
      <Progress value={pct} showLabel className="mb-8" />

      <ul className="space-y-6">
        {items.map((it, idx) => {
          const prevPhase = idx > 0 ? items[idx - 1]?.phase : null;
          const showHeader = it.phase && it.phase !== prevPhase;
          const checked = done.has(idx);
          return (
            <li key={idx} className="list-none">
              {showHeader ? (
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                  {it.phase}
                </p>
              ) : null}
              <div
                className={`flex gap-3 rounded-xl border border-[var(--border)] p-3 transition ${checked ? 'bg-[var(--success-bg)] opacity-80' : 'bg-[var(--bg-secondary)]'}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${checked ? 'border-[var(--success)] bg-[var(--success)] text-white' : 'border-[var(--border-bright)]'}`}
                  aria-pressed={checked}
                >
                  {checked ? '✓' : ''}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm text-[var(--text-primary)] ${checked ? 'line-through' : ''}`}>
                    {it.task}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Signal: {it.success_signal}</p>
                  {it.time_estimate ? (
                    <Badge variant="outline" className="mt-2 text-[10px]">
                      {it.time_estimate}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
