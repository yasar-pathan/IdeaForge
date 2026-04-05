'use client';

import { BarChart3, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export function MarketResearchCard({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return (
      <section
        id="market"
        className="module-card mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
      >
        <p className="text-sm text-[var(--text-muted)]">Market research not available yet.</p>
      </section>
    );
  }
  const tam = Number(data.tam ?? 0);
  const sam = Number(data.sam ?? 0);
  const som = Number(data.som ?? 0);
  const cagr = Number(data.cagr ?? 0);
  const demo = (data.demographics as Record<string, string>) ?? {};
  const trends = (data.trends as string[]) ?? [];
  const risks = (data.risks as string[]) ?? [];
  const regions = (data.top_regions as string[]) ?? [];

  return (
    <section
      id="market"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Market research</h2>
          <p className="text-sm text-[var(--text-secondary)]">{String(data.industry ?? '')}</p>
        </div>
      </div>
      <p className="mb-8 text-sm leading-relaxed text-[var(--text-secondary)]">{String(data.overview ?? '')}</p>

      <div className="mx-auto mb-8 flex max-w-md items-center justify-center gap-4">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-8 border-[var(--accent-primary)]/15" />
          <div className="absolute inset-4 rounded-full border-8 border-[var(--accent-primary)]/35" />
          <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full border-8 border-[var(--accent-primary)]/70 bg-[var(--bg-secondary)] text-center">
            <span className="font-mono text-xs text-[var(--text-muted)]">SOM</span>
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{formatNumber(som)}</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-[var(--text-muted)]">TAM </span>
            <span className="font-mono text-[var(--text-primary)]">{formatNumber(tam)}</span>
            <span className="block text-xs text-[var(--text-muted)]">{String(data.tam_label ?? '')}</span>
          </p>
          <p>
            <span className="text-[var(--text-muted)]">SAM </span>
            <span className="font-mono text-[var(--text-primary)]">{formatNumber(sam)}</span>
            <span className="block text-xs text-[var(--text-muted)]">{String(data.sam_label ?? '')}</span>
          </p>
          <p>
            <span className="text-[var(--text-muted)]">SOM </span>
            <span className="font-mono text-[var(--text-primary)]">{formatNumber(som)}</span>
            <span className="block text-xs text-[var(--text-muted)]">{String(data.som_label ?? '')}</span>
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-glow)] px-4 py-3">
        <TrendingUp className="h-5 w-5 text-[var(--accent-primary)]" />
        <span className="font-mono text-lg font-bold text-[var(--text-primary)]">{cagr}% CAGR</span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(demo).map(([k, v]) => (
          <span
            key={k}
            className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-xs text-[var(--text-secondary)]"
          >
            <span className="text-[var(--text-muted)]">{k}: </span>
            {v}
          </span>
        ))}
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Trends</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
          {trends.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </div>

      <div className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--warning)]">
          <AlertTriangle className="h-4 w-4" />
          Risks
        </p>
        <ul className="space-y-2">
          {risks.map((r, i) => (
            <li key={i} className="rounded-lg border border-[var(--warning)]/25 bg-[var(--warning-bg)] p-3 text-sm text-[var(--text-secondary)]">
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
          <MapPin className="h-4 w-4" />
          Top regions
        </p>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          {regions.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
