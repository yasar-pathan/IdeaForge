'use client';

import { useCallback, useEffect, useState } from 'react';

export function useSession(sessionId: string | null, enabled = true) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(!!enabled && !!sessionId);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load session');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !enabled) {
      setIsLoading(false);
      return;
    }
    refetch();
  }, [sessionId, enabled, refetch]);

  return { data, isLoading, error, refetch };
}
