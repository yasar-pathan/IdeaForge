'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SessionStatusState {
  status: string | null;
  progress: number;
  completedModules: string[];
  ideaTitle: string | null;
  ideaCategory: string | null;
  totalModules: number;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_POLL_MS = 4500;
const MAX_POLL_MS = 25_000;

export function useSessionStatus(sessionId: string | null, pollMs = DEFAULT_POLL_MS) {
  const [state, setState] = useState<SessionStatusState>({
    status: null,
    progress: 0,
    completedModules: [],
    ideaTitle: null,
    ideaCategory: null,
    totalModules: 13,
    isLoading: true,
    error: null,
  });

  const [intervalMs, setIntervalMs] = useState(pollMs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIntervalMs(pollMs);
  }, [sessionId, pollMs]);

  const fetchStatus = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}/status`, { credentials: 'include' });
      const raw = await res.text();
      let data: {
        error?: string;
        status?: string;
        progress?: number;
        completed_modules?: string[];
        idea_title?: string | null;
        idea_category?: string | null;
        total_modules?: number;
      } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error('Bad response from status API');
      }

      if (res.status === 429) {
        setIntervalMs((ms) => Math.min(ms * 2, MAX_POLL_MS));
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Too many requests — slowing refresh. Analysis may still be running.',
        }));
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Status failed');
      }

      setIntervalMs(pollMs);
      const st = data.status ?? null;
      setState((s) => ({
        ...s,
        status: st,
        progress: data.progress ?? 0,
        completedModules: data.completed_modules ?? [],
        ideaTitle: data.idea_title ?? null,
        ideaCategory: data.idea_category ?? null,
        totalModules: data.total_modules ?? 13,
        isLoading: false,
        error: null,
      }));
      if (st === 'complete' || st === 'failed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (e) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: e instanceof Error ? e.message : 'Failed to load status',
      }));
    }
  }, [sessionId, pollMs]);

  useEffect(() => {
    if (!sessionId) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await fetchStatus();
    };

    void tick();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionId, intervalMs, fetchStatus]);

  return { ...state, refetch: fetchStatus };
}
