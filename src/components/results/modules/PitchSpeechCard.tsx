'use client';

import { useState } from 'react';
import { Mic, Copy, Check, Play } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

export function PitchSpeechCard({ data }: { data: Record<string, unknown> | null }) {
  const [tab, setTab] = useState('full');
  const [copied, setCopied] = useState(false);
  const full = String(data?.full_speech ?? '');
  const parts = [
    ['Hook', data?.hook],
    ['Problem', data?.problem],
    ['Solution', data?.solution],
    ['Target market', data?.target_market],
    ['Business model', data?.business_model],
    ['Traction', data?.traction],
    ['Ask', data?.ask],
    ['Closing', data?.closing_line],
  ] as const;

  async function copy() {
    await navigator.clipboard.writeText(full);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  function readAloud() {
    if (!full || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(full);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
    toast.message('Reading aloud…');
  }

  return (
    <section
      id="pitch"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Pitch speech</h2>
            <p className="text-sm text-[var(--text-secondary)]">Script, breakdown, or listen</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy speech'}
        </Button>
      </div>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="mb-4 flex gap-2 rounded-lg bg-[var(--bg-secondary)] p-1">
          {['full', 'breakdown', 'read'].map((v) => (
            <Tabs.Trigger
              key={v}
              value={v}
              className="flex-1 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] transition data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)]"
            >
              {v === 'full' ? 'Full speech' : v === 'breakdown' ? 'Breakdown' : 'Read aloud'}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="full">
          <div className="rounded-xl border-l-4 border-[var(--accent-primary)] bg-[var(--bg-secondary)]/80 p-6 leading-relaxed text-[var(--text-primary)]">
            <p className="mb-4 border-b border-[var(--border)] pb-4 text-lg italic text-[var(--accent-primary)]">
              {String(data?.hook ?? '')}
            </p>
            <p className="whitespace-pre-wrap">{full}</p>
          </div>
        </Tabs.Content>
        <Tabs.Content value="breakdown" className="space-y-4">
          {parts.map(([label, val]) =>
            val ? (
              <div key={label} className="border-b border-[var(--border)] pb-4 last:border-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent-primary)]">
                  {label}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{String(val)}</p>
              </div>
            ) : null
          )}
          {Array.isArray(data?.how_it_works) ? (
            <div>
              <p className="mb-2 text-xs font-semibold text-[var(--text-accent)]">How it works</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                {(data?.how_it_works as string[]).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </Tabs.Content>
        <Tabs.Content value="read">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Button size="lg" onClick={readAloud}>
              <Play className="h-5 w-5" />
              Play narration
            </Button>
            <p className="max-w-sm text-center text-xs text-[var(--text-muted)]">
              Uses your browser&apos;s speech synthesis. Word highlighting is not available in all browsers.
            </p>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
