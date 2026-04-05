'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

type Row = {
  id: string;
  idea_title: string | null;
  idea_category: string | null;
  status: string;
  created_at: string;
  success_probability: { overall_score: number | null; verdict: string | null } | null;
};

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sessions', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setSessions(d.sessions || []);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editing) {
      setEditTitle(editing.idea_title ?? '');
      setEditCategory(editing.idea_category ?? '');
      setActionError(null);
    }
  }, [editing]);

  useEffect(() => {
    if (deleting) setActionError(null);
  }, [deleting]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const thisMonth = sessions.filter((s) => {
      const t = new Date(s.created_at);
      return t.getMonth() === month && t.getFullYear() === year;
    }).length;
    const scores = sessions
      .map((s) => s.success_probability?.overall_score)
      .filter((n): n is number => n != null);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const hi = scores.length ? Math.max(...scores) : 0;
    return { total, thisMonth, avg, hi };
  }, [sessions]);

  async function saveRename() {
    if (!editing) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const r = await fetch(`/api/sessions/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idea_title: editTitle.trim() || null,
          idea_category: editCategory.trim() || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Update failed');
      setSessions((prev) =>
        prev.map((x) =>
          x.id === editing.id
            ? {
                ...x,
                idea_title: d.session.idea_title,
                idea_category: d.session.idea_category,
              }
            : x
        )
      );
      setEditing(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const r = await fetch(`/api/sessions/${deleting.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Delete failed');
      setSessions((prev) => prev.filter((x) => x.id !== deleting.id));
      setDeleting(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="page-transition mx-auto max-w-7xl px-4 pb-24 pt-24">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Your ideas</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Pick up where you left off</p>
        </div>
        <Link href="/?forge=1">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            New analysis
          </Button>
        </Link>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total analyses', v: stats.total },
          { label: 'This month', v: stats.thisMonth },
          { label: 'Average score', v: stats.avg },
          { label: 'Highest score', v: stats.hi },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-[var(--text-primary)]">{s.v}</p>
          </Card>
        ))}
      </div>

      {error ? (
        <p className="mb-6 text-sm text-[var(--danger)]">{error}</p>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card variant="ghost" className="flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="mb-4 h-12 w-12 text-[var(--accent-primary)]" />
          <p className="font-display text-lg font-semibold text-[var(--text-primary)]">
            No analyses yet
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            Describe your startup on the home page and get a full investor-ready package in minutes.
          </p>
          <Link href="/" className="mt-6">
            <Button>Analyze your first idea</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s, i) => {
            const href = s.status === 'complete' ? `/results/${s.id}` : `/workspace/${s.id}`;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group relative flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start gap-2">
                    <Link href={href} className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 font-display font-bold text-[var(--text-primary)] transition hover:text-[var(--accent-primary)]">
                        {s.idea_title || 'Untitled idea'}
                      </h2>
                    </Link>
                    <div className="flex shrink-0 items-start gap-1">
                      {s.success_probability?.overall_score != null ? (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-primary)]/40 bg-[var(--accent-glow)] font-mono text-xs font-bold text-[var(--accent-primary)]">
                          {s.success_probability.overall_score}
                        </span>
                      ) : null}
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                            aria-label="Project actions"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="z-[150] min-w-[160px] rounded-xl border border-[var(--border-bright)] bg-[var(--bg-elevated)] p-1 shadow-xl"
                            sideOffset={6}
                            align="end"
                          >
                            <DropdownMenu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] outline-none data-[highlighted]:bg-[var(--bg-card)] data-[highlighted]:text-[var(--text-primary)]"
                              onSelect={() => setEditing(s)}
                            >
                              <Pencil className="h-4 w-4" />
                              Rename
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--danger)] outline-none data-[highlighted]:bg-[var(--bg-card)] data-[highlighted]:text-[var(--danger)]"
                              onSelect={() => setDeleting(s)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {s.idea_category ? (
                      <Badge variant="accent" className="text-[10px]">
                        {s.idea_category}
                      </Badge>
                    ) : null}
                    <Badge
                      variant={
                        s.status === 'complete' ? 'success' : s.status === 'failed' ? 'danger' : 'warning'
                      }
                      className="text-[10px]"
                    >
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{relTime(s.created_at)}</p>
                  <Link
                    href={href}
                    className="mt-4 text-sm font-medium text-[var(--accent-primary)] opacity-0 transition group-hover:opacity-100"
                  >
                    {s.status === 'complete' ? 'View results →' : 'Continue →'}
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!editing}
        onOpenChange={(v) => {
          if (!v) {
            setEditing(null);
            setActionError(null);
          }
        }}
        title="Rename project"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
              Title
            </label>
            <Input
              as="input"
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Project title"
            />
          </div>
          <div>
            <label htmlFor="edit-category" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
              Category
            </label>
            <Input
              as="input"
              id="edit-category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              placeholder="e.g. EdTech"
            />
          </div>
          {actionError ? <p className="text-sm text-[var(--danger)]">{actionError}</p> : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void saveRename()} disabled={actionLoading}>
              {actionLoading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleting}
        onOpenChange={(v) => {
          if (!v) {
            setDeleting(null);
            setActionError(null);
          }
        }}
        title="Delete project"
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Delete{' '}
          <span className="font-medium text-[var(--text-primary)]">
            {deleting?.idea_title?.trim() || 'Untitled idea'}
          </span>
          ? This removes the analysis and all generated modules. This cannot be undone.
        </p>
        {actionError ? <p className="mt-3 text-sm text-[var(--danger)]">{actionError}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setDeleting(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[var(--danger)] text-white hover:opacity-90"
            onClick={() => void confirmDelete()}
            disabled={actionLoading}
          >
            {actionLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
