'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/frontend/components/ui/Card';
import { Button } from '@/frontend/components/ui/Button';
import { Badge } from '@/frontend/components/ui/Badge';
import { Check } from 'lucide-react';
import { UpgradeModal } from '@/frontend/components/ui/UpgradeModal';

const tiers = [
  {
    name: 'Free',
    price: '₹0',
    desc: 'Try the full pipeline',
    features: ['3 analyses / month', 'All 12 modules', 'PPT download (branded)', 'Dashboard history'],
    cta: 'Start free',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/mo',
    desc: 'For serious builders',
    features: ['15 analyses / month', 'Priority Gemini Pro', 'White-label exports', 'Iteration tracking'],
    cta: 'Upgrade to Pro',
    action: 'checkout_pro',
    highlight: true,
  },
  {
    name: 'Founder',
    price: '₹1,499',
    period: '/mo',
    desc: 'For co-founding teams',
    features: ['Unlimited analyses', 'Team workspace (5 seats)', 'Investor one-pager', 'Everything in Pro'],
    cta: 'Start Founder plan',
    action: 'checkout_founder',
    highlight: false,
  },
];

export function Pricing() {
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; plan: 'pro' | 'founder' }>({ open: false, plan: 'pro' });

  const handleTierClick = (action?: string) => {
    if (action === 'checkout_pro') setUpgradeModal({ open: true, plan: 'pro' });
    if (action === 'checkout_founder') setUpgradeModal({ open: true, plan: 'founder' });
  };

  return (
    <section id="pricing" className="scroll-mt-24 py-24">
      <UpgradeModal open={upgradeModal.open} onOpenChange={(v) => setUpgradeModal(prev => ({ ...prev, open: v }))} defaultPlan={upgradeModal.plan} />
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
                {t.action ? (
                  <Button variant={t.highlight ? 'primary' : 'secondary'} className="w-full mt-8" onClick={() => handleTierClick(t.action)}>
                    {t.cta}
                  </Button>
                ) : (
                  <Link href={t.href || '/'} className="mt-8">
                    <Button variant={t.highlight ? 'primary' : 'secondary'} className="w-full">
                      {t.cta}
                    </Button>
                  </Link>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
