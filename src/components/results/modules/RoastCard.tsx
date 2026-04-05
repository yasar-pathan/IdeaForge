'use client';

import { useState } from 'react';
import { Flame, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type R = { roast?: string; why_it_matters?: string; rebuttal?: string };

export function RoastCard({ data }: { data: Record<string, unknown> | null }) {
  const [mode, setMode] = useState<'brutal' | 'optimist'>('brutal');
  const [revealed, setRevealed] = useState(false);
  const points = (data?.roast_points as R[]) ?? [];
  const verdict = String(data?.overall_verdict ?? '');

  return (
    <section
      id="roast"
      className="module-card card-hover relative mb-6 overflow-hidden rounded-[var(--radius-xl)] border border-[#3f2020] bg-[#0d0808] p-6"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(239,68,68,0.15)] text-[#f87171]">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#fecaca]">Roast mode</h2>
              <p className="text-sm text-[#9ca3af]">Brutally honest feedback</p>
            </div>
          </div>
          <div className="flex rounded-full border border-[#3f2020] p-1">
            <button
              type="button"
              onClick={() => setMode('brutal')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${mode === 'brutal' ? 'bg-[#7f1d1d] text-white' : 'text-[#9ca3af]'}`}
            >
              Brutal
            </button>
            <button
              type="button"
              onClick={() => setMode('optimist')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${mode === 'optimist' ? 'bg-[#14532d] text-white' : 'text-[#9ca3af]'}`}
            >
              Optimist
            </button>
          </div>
        </div>

        {!revealed ? (
          <div className="relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-[#3f2020] bg-black/40 p-8 backdrop-blur-md">
            <p className="mb-4 text-center text-sm text-[#9ca3af]">Sensitive content ahead</p>
            <Button variant="secondary" onClick={() => setRevealed(true)}>
              <Eye className="h-4 w-4" />I can handle the truth
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {points.map((p, i) => (
              <div key={i} className="rounded-xl border border-[#3f2020] bg-black/30 p-4">
                {mode === 'brutal' ? (
                  <>
                    <p className="text-sm font-semibold text-[#f87171]">{p.roast}</p>
                    <p className="mt-2 text-xs text-[#9ca3af]">{p.why_it_matters}</p>
                    <p className="mt-3 border-l-2 border-[#22c55e] pl-3 text-sm text-[#86efac]">
                      Rebuttal: {p.rebuttal}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[#86efac]">{p.rebuttal}</p>
                )}
              </div>
            ))}
            {verdict ? (
              <blockquote className="border-l-4 border-[#f87171] pl-4 text-sm italic text-[#d1d5db]">
                {verdict}
              </blockquote>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
