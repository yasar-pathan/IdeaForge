'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { UsageBar } from '@/components/ui/UsageBar';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { createBrowserSupabase } from '@/lib/supabase/client';

type ProfilePayload = {
  profile: {
    id: string;
    email: string;
    name: string;
    plan: 'free' | 'pro' | 'founder' | string;
    created_at: string;
  };
  usage: { used: number; limit: number; remaining: number };
  activity?: { totalAnalyses: number; thisMonth: number; avgScore: number; highestScore: number };
  billing?: {
    subscriptionStatus: string;
    nextBillingDate: string | null;
    razorpaySubscriptionId: string | null;
  };
};

export default function ProfilePage() {
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<'pro' | 'founder'>('pro');

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setName(d.profile?.name ?? '');
        setEmail(d.profile?.email ?? '');
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const plan = data?.profile.plan ?? 'free';
  const planPrice =
    plan === 'founder' ? '₹1,499 / month' : plan === 'pro' ? '₹499 / month' : '₹0 / month';
  const created = useMemo(
    () => (data?.profile.created_at ? new Date(data.profile.created_at).toLocaleDateString() : '—'),
    [data?.profile.created_at]
  );
  const nextBillingDate = useMemo(
    () => (data?.billing?.nextBillingDate ? new Date(data.billing.nextBillingDate).toLocaleDateString() : '—'),
    [data?.billing?.nextBillingDate]
  );

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Update failed');
      setData(body);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update profile');
    } finally {
      setSaving(false);
    }
  }

  async function openBillingPortal() {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST', credentials: 'include' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to open billing');
      if (body.url) window.location.href = body.url as string;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open billing');
    } finally {
      setBillingLoading(false);
    }
  }

  async function changePassword() {
    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const sb = createBrowserSupabase();
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update password');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function cancelSubscription() {
    setCancelLoading(true);
    try {
      const res = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        credentials: 'include',
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Cancel failed');
      toast.success('Subscription cancelled');
      const profileRes = await fetch('/api/profile', { credentials: 'include' });
      const profileBody = await profileRes.json();
      if (profileRes.ok) setData(profileBody);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24">
        <p className="text-sm text-[var(--text-muted)]">Loading profile…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24">
        <p className="text-sm text-[var(--danger)]">Could not load profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-24">
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} defaultPlan={upgradePlan} />

      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-[var(--text-primary)]">Account center</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Manage profile, security, billing, and usage in one place.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Account details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
                Name
              </label>
              <Input as="input" id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
                Email
              </label>
              <Input as="input" id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Changing email may require Supabase verification depending on auth settings.
              </p>
            </div>
            <div className="pt-2">
              <Button onClick={() => void saveProfile()} loading={saving}>
                Save profile
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Current plan</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-[var(--text-secondary)]">Plan</p>
            <div>
              {plan === 'founder' ? (
                <Badge variant="success">FOUNDER</Badge>
              ) : plan === 'pro' ? (
                <Badge variant="accent">PRO</Badge>
              ) : (
                <Badge variant="default">FREE</Badge>
              )}
            </div>
            <p className="text-[var(--text-secondary)]">Plan price: <span className="text-[var(--text-primary)]">{planPrice}</span></p>
            <p className="text-[var(--text-secondary)]">Next billing date: <span className="text-[var(--text-primary)]">{nextBillingDate}</span></p>
            <p className="text-[var(--text-secondary)]">
              Subscription status: <span className="text-[var(--text-primary)]">{data.billing?.subscriptionStatus || 'inactive'}</span>
            </p>
            <p className="text-[var(--text-secondary)]">Member since: {created}</p>
            <p className="text-[var(--text-secondary)]">Remaining analyses: {data.usage.remaining}</p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total analyses', value: data.activity?.totalAnalyses ?? 0 },
          { label: 'This month', value: data.activity?.thisMonth ?? 0 },
          { label: 'Average score', value: data.activity?.avgScore ?? 0 },
          { label: 'Highest score', value: data.activity?.highestScore ?? 0 },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Usage</h2>
          <div className="mt-4">
            {plan === 'free' ? (
              <UsageBar used={data.usage.used} limit={data.usage.limit} />
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)]">
                Used this month: <span className="font-semibold text-[var(--text-primary)]">{data.usage.used}</span><br />
                Remaining this month:{' '}
                <span className="font-semibold text-[var(--text-primary)]">{data.usage.remaining}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Billing actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {plan === 'free' ? (
              <>
                <Button onClick={() => { setUpgradePlan('pro'); setUpgradeOpen(true); }}>Upgrade to Pro</Button>
                <Button variant="secondary" onClick={() => { setUpgradePlan('founder'); setUpgradeOpen(true); }}>
                  Start Founder
                </Button>
              </>
            ) : null}
            {plan === 'pro' ? (
              <Button onClick={() => { setUpgradePlan('founder'); setUpgradeOpen(true); }}>
                Upgrade to Founder
              </Button>
            ) : null}
            {plan === 'founder' ? (
              <Button variant="secondary" onClick={() => void openBillingPortal()} loading={billingLoading}>
                Downgrade to Pro
              </Button>
            ) : null}
            <Button variant="ghost" loading={billingLoading} onClick={() => void openBillingPortal()}>
              Manage billing
            </Button>
            {plan !== 'free' ? (
              <Button variant="danger" loading={cancelLoading} onClick={() => void cancelSubscription()}>
                Cancel subscription
              </Button>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Change password</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
                New password
              </label>
              <Input
                as="input"
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
                Confirm new password
              </label>
              <Input
                as="input"
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => void changePassword()} loading={passwordLoading}>
              Update password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
