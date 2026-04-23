'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/hooks/useSession';
import { WORKSPACE_MODULE_ROWS, resultsHashForWorkspaceModule } from '@/lib/modules';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HyperSpeedLoader } from '@/components/ui/HyperSpeedLoader';
import { MODULE_STATUS_KEYS } from '@/lib/modules';

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
        <Button variant="secondary" size="sm" onClick={() => router.push(`/results/${sessionId}`)}>
          View all results
        </Button>
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
            <Card key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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
            </Card>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-[var(--text-muted)]">
        When every block is done, the session is marked complete. You can regenerate any section anytime.
      </p>
    </div>
  );
}
