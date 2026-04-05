'use client';

import { Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

type N = { name?: string; reasoning?: string; style?: string };

export function DomainCard({ data }: { data: Record<string, unknown> | null }) {
  const names = (data?.names as N[]) ?? [];

  async function copyName(name: string) {
    await navigator.clipboard.writeText(name);
    toast.success('Copied');
  }

  return (
    <section
      id="domains"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Domain names</h2>
          <p className="text-sm text-[var(--text-secondary)]">Brandable suggestions</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {names.map((n, i) => (
          <motion.button
            key={i}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => n.name && copyName(n.name)}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-left transition hover:border-[var(--accent-primary)]/50"
          >
            <p className="font-display text-lg font-bold text-[var(--text-primary)]">{n.name}</p>
            {n.style ? <Badge variant="outline" className="mt-2 text-[10px]">{n.style}</Badge> : null}
            <p className="mt-2 text-xs text-[var(--text-secondary)]">{n.reasoning}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {['.com', '.io', '.app'].map((ext) => (
                <span
                  key={ext}
                  className="rounded bg-[var(--success-bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--success)]"
                >
                  {ext} · check
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
