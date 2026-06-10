'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/frontend/components/ui/Button';
import { Tooltip } from '@/frontend/components/ui/Tooltip';
import { Download, Share2, FileDown } from 'lucide-react';

export function DownloadBar({
  sessionId,
  ideaTitle,
  shareToken,
  isPublic: initialIsPublic = false,
}: {
  sessionId: string;
  ideaTitle: string;
  shareToken?: string;
  isPublic?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);

  async function downloadPpt() {
    setDownloading(true);
    try {
      let res = await fetch(`/api/download-ppt?session_id=${sessionId}`, { credentials: 'include' });
      
      if (res.status === 404) {
        toast('Generating your Pitch Deck... Please wait 20-30 seconds.');
        
        // Trigger generation in the background without awaiting it to avoid blocking and triggering a 504 Gateway Timeout
        void fetch(`/api/sessions/${sessionId}/generate-module`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module: 'ppt_slides' })
        }).catch((err) => {
          console.warn('Background PPT generation trigger:', err);
        });

        // Poll the download-ppt endpoint every 3 seconds for up to 90 seconds total
        const maxPolls = 30;
        let success = false;
        
        for (let i = 0; i < maxPolls; i++) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          const pollRes = await fetch(`/api/download-ppt?session_id=${sessionId}`, { credentials: 'include' });
          if (pollRes.ok) {
            res = pollRes;
            success = true;
            break;
          }
        }

        if (!success) {
          throw new Error('PPT generation is taking longer than expected. Please try again in a moment.');
        }
      }

      if (!res.ok) throw new Error('not ready');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(ideaTitle || 'ideaforge-pitch').replace(/\s+/g, '-').toLowerCase()}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Pitch deck downloaded successfully!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'PPT not ready yet — try again in a moment');
    } finally {
      setDownloading(false);
    }
  }

  async function downloadPdf() {
    const el = document.querySelector('[data-pdf-root]');
    if (!el) {
      toast.error('Nothing to export');
      return;
    }
    setPdfLoading(true);
    try {
      const { exportElementToPdf } = await import('@/backend/lib/exportResultsPdf');
      const base = (ideaTitle || 'ideaforge-analysis').replace(/\s+/g, '-').toLowerCase();
      await exportElementToPdf(el as HTMLElement, `${base}.pdf`);
      toast.success('PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Could not create PDF. Try again or use Print → Save as PDF.');
    } finally {
      setPdfLoading(false);
    }
  }

  async function share() {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const url = shareToken ? `${base}/share/${shareToken}` : (typeof window !== 'undefined' ? window.location.href : '');
    void navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  }

  async function togglePublic() {
    try {
      const next = !isPublic;
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_public: next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to update visibility');
      setIsPublic(next);
      toast.success(next ? 'Session is now public' : 'Session is now private');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update visibility');
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] border-t border-[var(--border)] bg-[rgba(4,4,10,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <p className="truncate text-xs text-[var(--text-muted)]">
          <Link href="/" className="text-[var(--text-accent)] hover:underline">
            IdeaForge
          </Link>
          <span className="text-[var(--border-bright)]"> · </span>
          <span className="text-[var(--text-secondary)]">{ideaTitle || 'Analysis'}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={isPublic ? 'primary' : 'secondary'} size="sm" onClick={() => void togglePublic()}>
            {isPublic ? 'Public' : 'Make Public'}
          </Button>
          <Button variant="secondary" size="sm" onClick={share}>
            <Share2 className="h-4 w-4" />
            Share link
          </Button>
          <Button size="sm" loading={downloading} onClick={downloadPpt} disabled={pdfLoading}>
            <Download className="h-4 w-4" />
            Download PPT
          </Button>
          <Tooltip content="Saves the analysis sections as a PDF (screenshot-style)">
            <Button
              size="sm"
              variant="secondary"
              loading={pdfLoading}
              onClick={() => void downloadPdf()}
              disabled={downloading}
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
