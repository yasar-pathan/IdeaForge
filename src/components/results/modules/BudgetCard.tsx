'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type Line = {
  name?: string;
  description?: string;
  monthly_cost_usd?: number;
  category?: string;
  is_optional?: boolean;
};

const COLORS = ['#7C6EFA', '#A855F7', '#22C55E', '#F59E0B', '#EF4444', '#8888AA'];

export function BudgetCard({ data }: { data: Record<string, unknown> | null }) {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const rate = 84;
  const monthly = (data?.monthly_costs as Line[]) ?? [];
  const setup = (data?.setup_costs as Line[]) ?? [];

  const convert = (usd: number) => (currency === 'INR' ? usd * rate : usd);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    [...monthly, ...setup].forEach((row) => {
      const cat = row.category ?? 'Other';
      map[cat] = (map[cat] ?? 0) + (row.monthly_cost_usd ?? 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [monthly, setup]);

  const launch = Number(data?.burn_rate_launch ?? 0);
  const k1 = Number(data?.burn_rate_1k ?? 0);
  const k10 = Number(data?.burn_rate_10k ?? 0);

  return (
    <section
      id="budget"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Budget breakdown</h2>
            <p className="text-sm text-[var(--text-secondary)]">Costs by category</p>
          </div>
        </div>
        <div className="flex rounded-full border border-[var(--border)] p-1">
          {(['USD', 'INR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${currency === c ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-muted)]'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 h-64 w-full min-h-[16rem] min-w-0">
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={256} minWidth={0}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const n = typeof value === 'number' ? value : Number(value);
                  if (Number.isNaN(n)) return '';
                  return formatCurrency(convert(n), currency === 'INR' ? 'INR' : 'USD');
                }}
                contentStyle={{
                  background: '#13131f',
                  border: '1px solid #252540',
                  borderRadius: 8,
                  color: '#f0f0ff',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No cost data</p>
        )}
      </div>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Category</th>
              <th className="pb-2">Monthly</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)]/60">
                <td className={`py-2 pr-4 ${row.is_optional ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                  {row.name}
                </td>
                <td className="py-2 pr-4 text-[var(--text-secondary)]">{row.category}</td>
                <td className="py-2 font-mono text-[var(--text-primary)]">
                  {formatCurrency(convert(row.monthly_cost_usd ?? 0), currency === 'INR' ? 'INR' : 'USD')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--text-primary)]">Setup costs</summary>
        <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
          {setup.map((row, i) => (
            <li key={i}>
              {row.name} — {formatCurrency(convert(row.monthly_cost_usd ?? 0), currency === 'INR' ? 'INR' : 'USD')}
            </li>
          ))}
        </ul>
      </details>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'At launch', val: launch, c: 'border-[var(--success)]/40 bg-[var(--success-bg)]' },
          { label: 'At 1K users', val: k1, c: 'border-[var(--warning)]/40 bg-[var(--warning-bg)]' },
          { label: 'At 10K users', val: k10, c: 'border-[var(--danger)]/30 bg-[var(--danger-bg)]' },
        ].map((b) => (
          <div key={b.label} className={`rounded-xl border p-4 text-center ${b.c}`}>
            <p className="text-xs text-[var(--text-muted)]">{b.label}</p>
            <p className="mt-1 font-mono text-lg font-bold text-[var(--text-primary)]">
              {formatCurrency(convert(b.val), currency === 'INR' ? 'INR' : 'USD')}/mo
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
