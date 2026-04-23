'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const reg = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
      });
      const regJson = await reg.json();
      if (!reg.ok) {
        setError(regJson.error || 'Could not create account');
        return;
      }

      const sb = createBrowserSupabase();
      const { error: signErr } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (signErr) {
        setError(signErr.message || 'Account created but sign-in failed. Try signing in manually.');
        return;
      }
      router.refresh();
      router.push('/dashboard');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-up request failed';
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
    <div className="hero-glow relative z-[1] flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] px-6 py-24">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Create account</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Start analyzing ideas in minutes</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Name (optional)
            </label>
            <Input
              as="input"
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Founder"
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading} loading={loading}>
            Sign up
          </Button>
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-[var(--text-accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
      <Link
        href="/"
        className="mt-8 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
      >
        ← Home
      </Link>
    </div>
  );
}
