'use client';

import { useEffect } from 'react';

export function GlobalShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('ideaforge:open-analyze'));
      }
      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('ideaforge:close-modals'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
