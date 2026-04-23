'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const sb = createBrowserSupabase();
      const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        setError(err.message);
        return;
      }
      router.refresh();
      router.push(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-in request failed';
      const isNetworkFailure =
        msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network');
      setError(
        isNetworkFailure
          ? 'Unable to reach authentication server. Check internet/VPN/firewall and try again.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Sign in</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Welcome back to IdeaForge</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
            Email
          </label>
          <Input
            as="input"
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
            Password
          </label>
          <Input
            as="input"
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading} loading={loading}>
          Sign in
        </Button>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          No account?{' '}
          <Link href="/sign-up" className="font-medium text-[var(--text-accent)] hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="hero-glow relative z-[1] flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] px-6 py-24">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8">
            <p className="text-sm text-[var(--text-muted)]">Loading…</p>
          </Card>
        }
      >
        <SignInForm />
      </Suspense>
      <Link
        href="/"
        className="mt-8 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
      >
        ← Home
      </Link>
    </div>
  );
}
