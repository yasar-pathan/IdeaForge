'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/Button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

function normalizeMermaidCode(raw: string): string {
  let s = raw.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:mermaid)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  }
  s = s.replace(/\r\n/g, '\n');
  return sanitizeFlowchartBracketLabels(s);
}

/**
 * Unquoted `[...]` labels that contain `(` confuse the flowchart lexer (it treats `(` as a stadium
 * shape). AI-generated labels like [Screen (Teacher)] must use quoted text: ["Screen (Teacher)"].
 */
function sanitizeFlowchartBracketLabels(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (t.startsWith('%%')) return line;
      return line.replace(/(\b[A-Za-z_][\w]*)\[([^\]]+)\]/g, (full, id: string, inner: string) => {
        const trimmed = inner.trim();
        if (trimmed.startsWith('"')) return full;
        if (trimmed.startsWith('[')) return full;
        if (!/[()]/.test(inner)) return full;
        const escaped = inner.replace(/"/g, '#quot;');
        return `${id}["${escaped}"]`;
      });
    })
    .join('\n');
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    background: '#0D0D18',
    primaryColor: '#7C6EFA',
    primaryTextColor: '#F0F0FF',
    primaryBorderColor: '#252540',
    lineColor: '#555570',
    secondaryColor: '#13131F',
    tertiaryColor: '#0D0D18',
    edgeLabelBackground: '#13131F',
    clusterBkg: '#08080F',
  },
  flowchart: { curve: 'basis', htmlLabels: true },
});

export function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const normalized = normalizeMermaidCode(code);
    if (!ref.current) return;
    if (!normalized) {
      ref.current.innerHTML = '';
      queueMicrotask(() => setErr(null));
      return;
    }
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    let cancelled = false;
    (async () => {
      try {
        const { svg } = await mermaid.render(id, normalized);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setErr(null);
        }
      } catch (e) {
        console.error('Mermaid render failed:', e);
        if (!cancelled) setErr('Could not render diagram');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function exportPng() {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ui-flow.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => setScale((s) => Math.min(2, s + 0.1))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setScale(1)}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={exportPng}>
          Export SVG
        </Button>
      </div>
      <div className="max-h-[480px] min-h-[240px] min-w-0 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
        <div
          ref={ref}
          className="min-h-[200px] min-w-0 w-full"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        />
        {err ? <p className="text-sm text-[var(--danger)]">{err}</p> : null}
        {!code?.trim() ? <p className="text-sm text-[var(--text-muted)]">No diagram code</p> : null}
      </div>
    </div>
  );
}
