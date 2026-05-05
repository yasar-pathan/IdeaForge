'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

type Suggestion = {
  name?: string;
  description?: string;
  impact?: 'High' | 'Medium' | 'Low' | string;
  effort?: 'High' | 'Medium' | 'Low' | string;
  why_now?: string;
};

function impactVariant(impact?: string): 'success' | 'warning' | 'default' {
  if (impact === 'High') return 'success';
  if (impact === 'Medium') return 'warning';
  return 'default';
}

function effortVariant(effort?: string): 'danger' | 'warning' | 'accent' | 'default' {
  if (effort === 'High') return 'danger';
  if (effort === 'Medium') return 'warning';
  if (effort === 'Low') return 'accent';
  return 'default';
}

function SuggestionGrid({ items }: { items: Suggestion[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((f, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-medium text-[var(--text-primary)]">{f.name}</span>
            <Badge variant={impactVariant(f.impact)} className="text-[10px]">
              Impact: {f.impact || 'N/A'}
            </Badge>
            <Badge variant={effortVariant(f.effort)} className="text-[10px]">
              Effort: {f.effort || 'N/A'}
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{f.description}</p>
          {f.why_now ? (
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              <strong className="text-[var(--text-primary)]">Why now:</strong> {f.why_now}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function FeatureSuggestionsCard({ data }: { data: Record<string, unknown> | null }) {
  const mustHave = (data?.must_have_features as Suggestion[]) ?? [];
  const differentiators = (data?.differentiator_features as Suggestion[]) ?? [];
  const retention = (data?.retention_features as Suggestion[]) ?? [];
  const monetization = (data?.monetization_features as Suggestion[]) ?? [];
  const next3 = (data?.recommended_next_3 as string[]) ?? [];

  return (
    <section
      id="feature-suggestions"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Feature suggestions</h2>
          <p className="text-sm text-[var(--text-secondary)]">AI recommendations to improve the project</p>
        </div>
      </div>

      {next3.length > 0 ? (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Recommended next 3 features</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text-secondary)]">
            {next3.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Tabs.Root defaultValue="must-have">
        <Tabs.List className="mb-4 flex flex-wrap gap-2 rounded-lg bg-[var(--bg-secondary)] p-1">
          <Tabs.Trigger
            value="must-have"
            className="rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:font-semibold"
          >
            Must-have
          </Tabs.Trigger>
          <Tabs.Trigger
            value="differentiators"
            className="rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:font-semibold"
          >
            Differentiators
          </Tabs.Trigger>
          <Tabs.Trigger
            value="retention"
            className="rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:font-semibold"
          >
            Retention
          </Tabs.Trigger>
          <Tabs.Trigger
            value="monetization"
            className="rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:font-semibold"
          >
            Monetization
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="must-have">
          <SuggestionGrid items={mustHave} />
        </Tabs.Content>
        <Tabs.Content value="differentiators">
          <SuggestionGrid items={differentiators} />
        </Tabs.Content>
        <Tabs.Content value="retention">
          <SuggestionGrid items={retention} />
        </Tabs.Content>
        <Tabs.Content value="monetization">
          <SuggestionGrid items={monetization} />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
