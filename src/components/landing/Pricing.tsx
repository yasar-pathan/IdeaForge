'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Try the full pipeline',
    features: ['3 analyses / month', 'All modules', 'PPT download', 'Dashboard history'],
    cta: 'Start free',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/mo',
    desc: 'For serious builders',
    features: ['Unlimited analyses', 'Priority generation', 'Everything in Free'],
    cta: 'Upgrade (soon)',
    href: '/sign-up',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: '/mo',
    desc: 'For small teams',
    features: ['Shared workspace (soon)', 'Unlimited analyses', 'Export & share'],
    cta: 'Contact (soon)',
    href: '/sign-up',
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
          Simple pricing
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[var(--text-secondary)]">
          Start free. Upgrade when IdeaForge becomes part of your workflow.
        </p>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                variant={t.highlight ? 'elevated' : 'default'}
                className={`relative flex h-full flex-col p-8 ${
                  t.highlight
                    ? 'ring-2 ring-[var(--accent-primary)]/60 shadow-[var(--shadow-glow)]'
                    : ''
                }`}
              >
                {t.highlight ? (
                  <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most popular
                  </Badge>
                ) : null}
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{t.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{t.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold text-[var(--text-primary)]">{t.price}</span>
                  {t.period ? (
                    <span className="text-[var(--text-muted)]">{t.period}</span>
                  ) : null}
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={t.href} className="mt-8">
                  <Button variant={t.highlight ? 'primary' : 'secondary'} className="w-full">
                    {t.cta}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
