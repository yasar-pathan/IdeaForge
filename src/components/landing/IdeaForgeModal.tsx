'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAnalysis } from '@/hooks/useAnalysis';

const examples = [
  'AI-powered resume screener for HR teams',
  'Peer-to-peer skill exchange marketplace',
  'Smart expense tracker for freelancers',
  'Gamified language learning for kids',
];

export function IdeaForgeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [idea, setIdea] = useState('');
  const { submit, isLoading } = useAnalysis();
  const len = idea.trim().length;
  const valid = len >= 20 && len <= 2000;

  useEffect(() => {
    const openModal = () => onOpenChange(true);
    const close = () => onOpenChange(false);
    window.addEventListener('ideaforge:open-analyze', openModal);
    window.addEventListener('ideaforge:close-modals', close);
    return () => {
      window.removeEventListener('ideaforge:open-analyze', openModal);
      window.removeEventListener('ideaforge:close-modals', close);
    };
  }, [onOpenChange]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    await submit(idea.trim());
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Forge your idea">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Describe your startup in a few sentences. Minimum 20 characters.
        </p>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g. An app that helps remote teams run async standups with AI summaries and action items..."
          className="min-h-[140px] w-full resize-y rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          maxLength={2000}
        />
        <div className="flex justify-end text-xs text-[var(--text-muted)]">
          {len} / 2000 {len < 20 ? `(need ${20 - len} more)` : ''}
        </div>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setIdea(ex)}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-left text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)]/50 hover:text-[var(--text-primary)]"
            >
              {ex}
            </button>
          ))}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={!valid} loading={isLoading}>
          Forge My Idea ⚡
        </Button>
      </form>
    </Modal>
  );
}
