'use client';

import { Coins, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

type S = {
  model_name?: string;
  application?: string;
  pros?: string[];
  cons?: string[];
  fit_score?: number;
  examples?: string[];
  revenue_projection_1k_users?: string;
};

export function MonetizationCard({ data }: { data: Record<string, unknown> | null }) {
  const strategies = ([...(data?.strategies as S[]) ?? []] as S[]).sort(
    (a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0)
  );
  const rec = String(data?.recommended_model ?? '');
  const why = String(data?.recommendation_reasoning ?? '');

  return (
    <section
      id="monetization"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Monetization</h2>
          <p className="text-sm text-[var(--text-secondary)]">Models ranked by fit</p>
        </div>
      </div>

      <div className="space-y-4">
        {strategies.map((s, i) => {
          const fs = s.fit_score ?? 0;
          const isRec = rec && s.model_name === rec;
          const scoreColor =
            fs >= 8 ? 'text-[var(--success)]' : fs >= 5 ? 'text-[var(--warning)]' : 'text-[var(--danger)]';
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 ${isRec ? 'border-[#f59e0b]/60 bg-[var(--warning-bg)]' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}
            >
              {isRec ? (
                <div className="mb-2 flex items-center gap-1 text-xs font-bold text-[var(--warning)]">
                  <Star className="h-3 w-3 fill-current" /> Recommended
                </div>
              ) : null}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">{s.model_name}</h3>
                <span className={`font-mono text-xl font-bold ${scoreColor}`}>{fs}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{s.application}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {(s.pros ?? []).map((p, j) => (
                  <Badge key={j} variant="success" className="text-[10px]">
                    {p}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(s.cons ?? []).map((p, j) => (
                  <Badge key={j} variant="danger" className="text-[10px]">
                    {p}
                  </Badge>
                ))}
              </div>
              {s.revenue_projection_1k_users ? (
                <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]">
                  💵 @ 1k users: {s.revenue_projection_1k_users}
                </div>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-1">
                {(s.examples ?? []).map((ex, j) => (
                  <span key={j} className="rounded-full bg-[var(--bg-card)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {why ? (
        <div className="mt-6 rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-glow)] p-4">
          <p className="text-sm font-semibold text-[var(--accent-primary)]">Why this model</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{why}</p>
        </div>
      ) : null}
    </section>
  );
}
