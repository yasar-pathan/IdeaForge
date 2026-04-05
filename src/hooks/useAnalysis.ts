'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useAnalysis() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (idea: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idea }),
        });
        const raw = await res.text();
        let data: { error?: string; detail?: string; hint?: string; session_id?: string } = {};
        try {
          data = raw ? (JSON.parse(raw) as typeof data) : {};
        } catch {
          const isHtml = raw.trimStart().startsWith('<!') || raw.includes('<!DOCTYPE');
          throw new Error(
            isHtml
              ? 'Server returned an error page instead of JSON. Restart dev server and check the terminal for API errors.'
              : 'Invalid response from server. Try again.'
          );
        }
        if (res.status === 401) {
          toast.error('Sign in to analyze your idea');
          router.push(`/sign-in?next=${encodeURIComponent('/')}`);
          return null;
        }
        if (!res.ok) {
          const msg = [data.error, data.detail, data.hint].filter(Boolean).join(' — ');
          throw new Error(msg || 'Analysis failed');
        }
        toast.success('Workspace ready — generate each section when you want');
        router.push(`/workspace/${data.session_id}`);
        return data.session_id as string;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Something went wrong';
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return { submit, isLoading, error };
}
