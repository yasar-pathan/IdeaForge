'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { Search, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

type Comp = {
  name?: string;
  description?: string;
  rating?: string;
  funding?: string;
  strengths?: string[];
  weaknesses?: string[];
  pricing?: string;
  audience?: string;
};

export function CompetitorCard({ data }: { data: Record<string, unknown> | null }) {
  const competitors = (data?.competitors as Comp[]) ?? [];
  const gap = String(data?.market_gap ?? '');
  const diff = (data?.differentiation_opportunities as string[]) ?? [];

  return (
    <section
      id="competitors"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Competitor intelligence</h2>
          <p className="text-sm text-[var(--text-secondary)]">{competitors.length} competitors analyzed</p>
        </div>
      </div>

      <Accordion.Root type="multiple" className="space-y-2">
        {competitors.map((c, i) => (
          <Accordion.Item
            key={i}
            value={`c-${i}`}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] [&[data-state=open]>svg:last-child]:rotate-180">
                <span>{c.name ?? 'Unknown'}</span>
                <div className="flex items-center gap-2">
                  {c.rating ? <Badge variant="outline">{c.rating}</Badge> : null}
                  {c.funding ? <Badge variant="accent">{c.funding}</Badge> : null}
                  <ChevronDown className="h-4 w-4 shrink-0 transition duration-200" />
                </div>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="border-t border-[var(--border)]">
              <div className="px-4 py-3">
              <p className="mb-3 text-sm text-[var(--text-secondary)]">{c.description}</p>
              <p className="mb-2 text-xs text-[var(--text-muted)]">Audience: {c.audience}</p>
              <p className="mb-3 text-xs text-[var(--text-muted)]">Pricing: {c.pricing}</p>
              <div className="mb-2 flex flex-wrap gap-1">
                {(c.strengths ?? []).map((s, j) => (
                  <Badge key={j} variant="success" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {(c.weaknesses ?? []).map((s, j) => (
                  <Badge key={j} variant="danger" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>

      {gap ? (
        <div className="mt-6 rounded-xl border border-[var(--accent-primary)]/40 bg-[var(--accent-glow)] p-4">
          <p className="mb-2 text-sm font-semibold text-[var(--accent-primary)]">Market gap</p>
          <p className="text-sm text-[var(--text-secondary)]">{gap}</p>
        </div>
      ) : null}

      {diff.length > 0 ? (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">Differentiation opportunities</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {diff.map((d, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)]"
              >
                <span className="font-mono text-[var(--accent-primary)]">{i + 1}. </span>
                {d}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
