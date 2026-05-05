import { useCallback } from 'react';

export function usePendingIdea() {
  const save = useCallback((idea: string) => localStorage.setItem('ideaforge_pending_idea', idea), []);
  const get = useCallback(() => localStorage.getItem('ideaforge_pending_idea'), []);
  const clear = useCallback(() => localStorage.removeItem('ideaforge_pending_idea'), []);
  return { save, get, clear };
}
