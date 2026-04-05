'use client';

import { useState, useEffect } from 'react';
import { Map } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MermaidDiagram } from '@/components/results/MermaidDiagram';

type Screen = { name?: string; purpose?: string; ui_elements?: string[]; connections?: string[] };

export function UIFlowCard({ data }: { data: Record<string, unknown> | null }) {
  const screens = (data?.screens as Screen[]) ?? [];
  const initialCode = String(data?.mermaid_code ?? 'flowchart TD\n    A[Start] --> B[End]');
  const [code, setCode] = useState(initialCode);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCode(String(data?.mermaid_code ?? 'flowchart TD\n    A[Start] --> B[End]'));
  }, [data?.mermaid_code]);

  return (
    <section
      id="uiflow"
      className="module-card card-hover mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">UI flow</h2>
            <p className="text-sm text-[var(--text-secondary)]">Screens + diagram</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Edit flow
        </Button>
      </div>

      <MermaidDiagram code={code} />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {screens.map((s, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
            <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{s.purpose}</p>
            <p className="mt-2 text-[10px] text-[var(--text-muted)]">
              {(s.ui_elements ?? []).length} UI elements
            </p>
          </div>
        ))}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="Edit Mermaid diagram">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-[200px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 font-mono text-xs text-[var(--text-primary)]"
        />
        <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
          Done
        </Button>
      </Modal>
    </section>
  );
}
