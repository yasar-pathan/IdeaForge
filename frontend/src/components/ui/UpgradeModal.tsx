'use client';

import { useEffect } from 'react';
import { Modal } from '@/frontend/components/ui/Modal';
import { Button } from '@/frontend/components/ui/Button';
import { useBilling } from '@/frontend/hooks/useBilling';
import Script from 'next/script';
import { Badge } from '@/frontend/components/ui/Badge';
import { Check } from 'lucide-react';

export function UpgradeModal({
  open,
  onOpenChange,
  defaultPlan = 'pro',
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultPlan?: 'pro' | 'founder';
}) {
  const { checkout, loading } = useBilling();

  useEffect(() => {
    if (!open) return;
    const close = () => onOpenChange(false);
    window.addEventListener('ideaforge:close-modals', close);
    return () => window.removeEventListener('ideaforge:close-modals', close);
  }, [open, onOpenChange]);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Modal open={open} onOpenChange={onOpenChange} title="Upgrade your plan">
        <div className="grid gap-6 sm:grid-cols-2 mt-4">
          <div className={`rounded-xl border p-6 flex flex-col ${defaultPlan === 'pro' ? 'border-[var(--accent-primary)] bg-[var(--bg-elevated)] ring-1 ring-[var(--accent-primary)]' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}>
            {defaultPlan === 'pro' && <Badge variant="accent" className="w-fit mb-2">Recommended</Badge>}
            <h3 className="font-bold text-lg text-[var(--text-primary)]">Pro</h3>
            <div className="mt-2 text-3xl font-mono text-[var(--text-primary)]">₹499<span className="text-sm text-[var(--text-muted)]">/mo</span></div>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--success)]" /> 15 ideas / month</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--success)]" /> Priority generation</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--success)]" /> White-label exports</li>
            </ul>
            <Button className="mt-6 w-full" loading={loading} onClick={() => checkout('pro')} variant={defaultPlan === 'pro' ? 'primary' : 'secondary'}>
              Upgrade to Pro
            </Button>
          </div>
          
          <div className={`rounded-xl border p-6 flex flex-col ${defaultPlan === 'founder' ? 'border-[var(--accent-primary)] bg-[var(--bg-elevated)] ring-1 ring-[var(--accent-primary)]' : 'border-[var(--border)] bg-[var(--bg-secondary)]'}`}>
            <h3 className="font-bold text-lg text-[var(--text-primary)]">Founder</h3>
            <div className="mt-2 text-3xl font-mono text-[var(--text-primary)]">₹1,499<span className="text-sm text-[var(--text-muted)]">/mo</span></div>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--success)]" /> Unlimited analyses</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--success)]" /> Team workspace (5 seats)</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--success)]" /> Investor one-pager</li>
            </ul>
            <Button className="mt-6 w-full" loading={loading} onClick={() => checkout('founder')} variant={defaultPlan === 'founder' ? 'primary' : 'secondary'}>
              Start Founder plan
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
