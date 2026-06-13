'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/frontend/hooks/useSession';
import { WORKSPACE_MODULE_ROWS, resultsHashForWorkspaceModule } from '@/backend/lib/modules';
import { Button } from '@/frontend/components/ui/Button';
import { Card } from '@/frontend/components/ui/Card';
import { Badge } from '@/frontend/components/ui/Badge';
import { HyperSpeedLoader } from '@/frontend/components/ui/HyperSpeedLoader';
import { MODULE_STATUS_KEYS } from '@/backend/lib/modules';
import { motion } from 'framer-motion';
import { playChime } from '@/frontend/lib/audio';
import { AIThinkingTicker } from '@/frontend/components/ui/AIThinkingTicker';
import { SoundToggleButton } from '@/frontend/components/ui/SoundToggleButton';
import { Modal } from '@/frontend/components/ui/Modal';
import { StartupClicker } from '@/frontend/components/ui/StartupClicker';

type ModuleStatusRow = Record<string, boolean | string | null | undefined>;

function isDone(
  moduleId: string,
  session: Record<string, unknown> | null,
  moduleStatus: ModuleStatusRow | null
): boolean {
  if (moduleId === 'idea_title') {
    return Boolean(session?.idea_title);
  }
  return moduleStatus?.[moduleId] === true;
}

export function WorkspaceClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useSession(sessionId, true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showGameModal, setShowGameModal] = useState(false);

  useEffect(() => {
    if (!loadingId) {
      setElapsed(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loadingId]);

  const session = (data?.session as Record<string, unknown>) ?? null;
  const moduleStatus = (data?.module_status as ModuleStatusRow) ?? null;
  const rawPreview = String(session?.raw_idea ?? '').slice(0, 280);
  const title = String(session?.idea_title ?? 'Your idea');

  const doneCount = useMemo(() => {
    let n = 0;
    if (session?.idea_title) n += 1;
    for (const k of MODULE_STATUS_KEYS) {
      if (moduleStatus?.[k] === true) n += 1;
    }
    return n;
  }, [session, moduleStatus]);

  const totalPickable = 1 + MODULE_STATUS_KEYS.length;

  const runModule = useCallback(
    async (moduleId: string) => {
      setLoadingId(moduleId);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/generate-module`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ module: moduleId }),
        });
        const raw = await res.text();
        let body: { error?: string } = {};
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          throw new Error('Bad response from server');
        }
        if (!res.ok) {
          throw new Error(body.error || 'Generation failed');
        }

        // Poll for completion
        let completed = false;
        const maxPolls = 40; // 40 * 1.5s = 60s max poll
        for (let poll = 0; poll < maxPolls; poll++) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const checkRes = await fetch(`/api/sessions/${sessionId}`, { credentials: 'include' });
          if (!checkRes.ok) continue;
          
          const checkData = await checkRes.json();
          const checkSession = checkData?.session as Record<string, unknown> | null;
          const checkStatus = checkData?.module_status as ModuleStatusRow | null;
          
          if (isDone(moduleId, checkSession, checkStatus)) {
            completed = true;
            break;
          }
        }

        if (!completed) {
          throw new Error('Generation is taking longer than expected. Please refresh the page in a moment to check.');
        }

        playChime();
        toast.success(`${WORKSPACE_MODULE_ROWS.find((r) => r.id === moduleId)?.label ?? 'Module'} ready`);
        await refetch();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed');
      } finally {
        setLoadingId(null);
      }
    },
    [sessionId, refetch]
  );

  if (isLoading && !data) {
    return <HyperSpeedLoader title="Forging your workspace" subtitle="Booting modules and linking result pipeline" />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-[var(--danger)]">{error || 'Not found'}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-[var(--accent-primary)]">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="page-transition mx-auto max-w-3xl px-4 pb-24 pt-24">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <SoundToggleButton />
          <Button variant="secondary" size="sm" onClick={() => setShowGameModal(true)}>
            🎮 Startup Clicker
          </Button>
          <Button variant="secondary" size="sm" onClick={() => router.push(`/results/${sessionId}`)}>
            View all results
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Sparkles className="h-6 w-6 text-[var(--accent-primary)]" />
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Build your package</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Generate only what you need. Each button runs one AI job. Progress:{' '}
          <span className="font-mono text-[var(--text-primary)]">
            {doneCount}/{totalPickable}
          </span>{' '}
          done. <strong className="text-[var(--text-primary)]">Finished sections</strong> are on the{' '}
          <button
            type="button"
            onClick={() => router.push(`/results/${sessionId}`)}
            className="text-[var(--accent-primary)] underline decoration-[var(--accent-primary)]/50 underline-offset-2 hover:decoration-[var(--accent-primary)]"
          >
            results page
          </button>{' '}
          (use &quot;View this result&quot; on each card to jump to that block).
        </p>
        <p className="mt-3 font-medium text-[var(--text-primary)]">{title}</p>
        {rawPreview ? (
          <p className="mt-2 line-clamp-4 text-xs text-[var(--text-muted)]">{rawPreview}…</p>
        ) : null}
      </div>

      <div className="space-y-3">
        {WORKSPACE_MODULE_ROWS.map((row) => {
          const done = isDone(row.id, session, moduleStatus);
          const busy = loadingId === row.id;
          return (
            <Card key={row.id} className="flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold text-[var(--text-primary)]">{row.label}</span>
                    {done ? (
                      <Badge variant="success" className="text-[10px]">
                        <Check className="mr-0.5 h-3 w-3" />
                        Done
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{row.hint}</p>
                  {done ? (
                    <Link
                      href={`/results/${sessionId}${resultsHashForWorkspaceModule(row.id)}`}
                      className="mt-2 inline-flex text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                    >
                      {row.id === 'idea_title'
                        ? 'View title & category on results →'
                        : row.id === 'ppt_slides'
                          ? 'Open results (download PPT at bottom) →'
                          : 'View this result →'}
                    </Link>
                  ) : null}
                </div>
                <Button
                  size="md"
                  variant={done ? 'secondary' : 'primary'}
                  disabled={busy}
                  loading={busy}
                  onClick={() => runModule(row.id)}
                  className="w-full shrink-0 sm:w-40"
                >
                  {busy ? (
                    'Working…'
                  ) : done ? (
                    'Regenerate'
                  ) : (
                    'Generate'
                  )}
                </Button>
              </div>

              {busy && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden rounded-xl border border-[var(--accent-primary)]/20 bg-[var(--bg-secondary)] p-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <AIThinkingTicker moduleId={row.id} />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      ⏱ {elapsed}s elapsed — forging result...
                    </span>
                  </div>
                  {/* Micro-shimmer bar */}
                  <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#7C6EFA] to-[#A855F7] animate-pulse" />
                  </div>
                  {/* Proactive Game Pitch */}
                  <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2.5">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ⚡ Takes ~30-40 seconds
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGameModal(true)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
                    >
                      🎮 Bored? Play Startup Clicker while you wait →
                    </button>
                  </div>
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-[var(--text-muted)]">
        When every block is done, the session is marked complete. You can regenerate any section anytime.
      </p>

      {/* Startup Clicker Modal */}
      <Modal
        open={showGameModal}
        onOpenChange={setShowGameModal}
        title="Unicorn Clicker Simulator"
        className="w-[min(94vw,620px)]"
      >
        <StartupClicker />
      </Modal>
    </div>
  );
}
