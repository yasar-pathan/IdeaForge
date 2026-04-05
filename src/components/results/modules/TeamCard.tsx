'use client';

import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

type Role = {
  title?: string;
  responsibilities?: string[];
  skills?: string[];
  salary_india?: number;
  salary_us?: number;
  hire_as?: string;
};

function RoleCard({ r }: { r: Role }) {
  const hire = r.hire_as ?? '';
  const variant =
    hire.includes('founder') || hire.includes('Co')
      ? 'accent'
      : hire.includes('Full')
        ? 'default'
        : 'outline';
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-display font-bold text-[var(--text-primary)]">{r.title}</h4>
            {hire ? (
              <Badge variant={variant as 'accent' | 'default' | 'outline'} className="text-[10px]">
                {hire}
              </Badge>
            ) : null}
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[var(--text-secondary)]">
            {(r.responsibilities ?? []).map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-1">
            {(r.skills ?? []).map((s, i) => (
              <span key={i} className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 gap-3 font-mono text-xs">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-center">
            <div className="text-[var(--text-muted)]">🇮🇳 / mo</div>
            <div className="text-[var(--text-primary)]">{formatCurrency(r.salary_india ?? 0)}</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-center">
            <div className="text-[var(--text-muted)]">🇺🇸 / mo</div>
            <div className="text-[var(--text-primary)]">{formatCurrency(r.salary_us ?? 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamCard({ data }: { data: Record<string, unknown> | null }) {
  const founding = (data?.founding_roles as Role[]) ?? [];
  const hires = (data?.early_hires as Role[]) ?? [];
  const india = Number(data?.total_monthly_salary_india ?? 0);
  const us = Number(data?.total_monthly_salary_us ?? 0);

  return (
    <section
      id="team"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Team structure</h2>
          <p className="text-sm text-[var(--text-secondary)]">Roles and monthly cost</p>
        </div>
      </div>

      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">Founding team</p>
      <div className="mb-8 space-y-3">
        {founding.map((r, i) => (
          <RoleCard key={i} r={r} />
        ))}
      </div>

      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">Early hires</p>
      <div className="mb-8 space-y-3">
        {hires.map((r, i) => (
          <RoleCard key={i} r={r} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success-bg)] p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">Total India / mo</p>
          <p className="font-mono text-xl font-bold text-[var(--success)]">{formatCurrency(india)}</p>
        </div>
        <div className="rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-glow)] p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">Total US / mo</p>
          <p className="font-mono text-xl font-bold text-[var(--text-primary)]">{formatCurrency(us)}</p>
        </div>
      </div>
    </section>
  );
}
