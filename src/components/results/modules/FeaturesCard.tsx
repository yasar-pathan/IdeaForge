'use client';

import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import { Wrench, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

type F = { name?: string; description?: string; estimated_days?: number; priority?: string };

function FeatureGrid({ items }: { items: F[] }) {
  const totalDays = items.reduce((s, f) => s + (f.estimated_days ?? 0), 0);
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((f, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-medium text-[var(--text-primary)]">{f.name}</span>
              {f.priority ? (
                <Badge
                  variant={
                    f.priority === 'Critical'
                      ? 'danger'
                      : f.priority === 'High'
                        ? 'warning'
                        : f.priority === 'Medium'
                          ? 'accent'
                          : 'default'
                  }
                  className="text-[10px]"
                >
                  {f.priority}
                </Badge>
              ) : null}
              {f.estimated_days != null ? (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {f.estimated_days}d
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{f.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-[var(--text-muted)]">Total estimate: ~{totalDays} dev days</p>
    </>
  );
}

export function FeaturesCard({ data }: { data: Record<string, unknown> | null }) {
  const mvp = (data?.mvp_features as F[]) ?? [];
  const v1 = (data?.v1_features as F[]) ?? [];
  const v2 = (data?.v2_features as F[]) ?? [];
  const wf = (data?.dev_workflow as Record<string, unknown>) ?? {};

  return (
    <section
      id="features"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Feature roadmap</h2>
          <p className="text-sm text-[var(--text-secondary)]">MVP through V2</p>
        </div>
      </div>

      <Tabs.Root defaultValue="mvp">
        <Tabs.List className="mb-4 flex gap-2 rounded-lg bg-[var(--bg-secondary)] p-1">
          {[
            ['mvp', 'MVP', 'text-[var(--success)]'],
            ['v1', 'V1', 'text-[var(--accent-primary)]'],
            ['v2', 'V2', 'text-[#A855F7]'],
          ].map(([v, l, c]) => (
            <Tabs.Trigger
              key={v}
              value={v}
              className={`flex-1 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] ${c} data-[state=active]:font-semibold`}
            >
              {l}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="mvp">
          <FeatureGrid items={mvp} />
        </Tabs.Content>
        <Tabs.Content value="v1">
          <FeatureGrid items={v1} />
        </Tabs.Content>
        <Tabs.Content value="v2">
          <FeatureGrid items={v2} />
        </Tabs.Content>
      </Tabs.Root>

      {Object.keys(wf).length > 0 ? (
        <Accordion.Root type="single" collapsible className="mt-8">
          <Accordion.Item value="wf" className="rounded-xl border border-[var(--border)]">
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[var(--text-primary)] [&[data-state=open]_svg]:rotate-180">
                Dev workflow
                <ChevronDown className="h-4 w-4 transition duration-200" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              <p>
                <strong className="text-[var(--text-primary)]">Team:</strong> {String(wf.team ?? '')}
              </p>
              <p className="mt-2">
                <strong className="text-[var(--text-primary)]">Stack:</strong> {String(wf.stack ?? '')}
              </p>
              <p className="mt-2">
                <strong className="text-[var(--text-primary)]">Methodology:</strong>{' '}
                {String(wf.methodology ?? '')}
              </p>
              <ul className="mt-2 list-disc pl-5">
                {((wf.tech_risks as string[]) ?? []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      ) : null}
    </section>
  );
}
