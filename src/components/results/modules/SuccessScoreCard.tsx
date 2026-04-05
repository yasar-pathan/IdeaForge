'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

const dims: { key: string; label: string; tip: string }[] = [
  { key: 'problem_clarity', label: 'Problem clarity', tip: 'How clear and painful is the problem?' },
  { key: 'market_size', label: 'Market size', tip: 'TAM and growth potential' },
  { key: 'competition', label: 'Competition', tip: 'Crowdedness of the space' },
  { key: 'technical_feasibility', label: 'Technical feasibility', tip: 'Build complexity' },
  { key: 'monetization', label: 'Monetization', tip: 'Path to revenue' },
  { key: 'timing', label: 'Timing', tip: 'Market timing and trends' },
  { key: 'founder_market_fit', label: 'Founder–market fit', tip: 'Domain advantage' },
  { key: 'virality', label: 'Virality', tip: 'Organic growth potential' },
];

function verdictVariant(v: string): 'success' | 'warning' | 'danger' | 'default' {
  if (!v) return 'default';
  if (v.includes('Strong')) return 'success';
  if (v.includes('Promising')) return 'warning';
  if (v.includes('Risky') || v.includes('High Risk')) return 'danger';
  return 'default';
}

export function SuccessScoreCard({ data }: { data: Record<string, unknown> | null }) {
  const [display, setDisplay] = useState(0);
  const score = Number(data?.overall_score ?? 0);
  const verdict = String(data?.verdict ?? '');
  const actions = (data?.improvement_actions as string[]) ?? [];

  useEffect(() => {
    const t0 = performance.now();
    const dur = 1500;
    let raf: number;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setDisplay(Math.round(score * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const pct = Math.min(100, Math.max(0, score));

  return (
    <section
      id="success"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Success score</h2>
          <p className="text-sm text-[var(--text-secondary)]">Eight-dimension startup viability model</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <svg className="-rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#sg)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 264} 264`}
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(pct / 100) * 264} 264` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7C6EFA" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <p className="font-mono text-4xl font-bold gradient-text">{display}</p>
            <p className="text-xs text-[var(--text-muted)]">/ 100</p>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          {verdict ? (
            <Badge variant={verdictVariant(verdict)} className="text-sm">
              {verdict}
            </Badge>
          ) : null}
          <div className="space-y-3">
            {dims.map(({ key, label, tip }) => {
              const v = Number(data?.[key] ?? 0);
              const w = Math.min(10, Math.max(0, v)) * 10;
              const color =
                v >= 7 ? 'bg-[var(--success)]' : v >= 4 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]';
              return (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <Tooltip content={tip}>
                    <span className="w-36 shrink-0 cursor-help text-[var(--text-secondary)]">{label}</span>
                  </Tooltip>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                    <motion.div
                      className={`h-full rounded-full ${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="w-8 font-mono text-[var(--text-primary)]">{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {actions.length > 0 ? (
        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">Improvement actions</p>
          <ol className="space-y-2">
            {actions.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
              >
                <span className="font-mono text-[var(--accent-primary)]">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
