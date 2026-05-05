'use client';

import { useRef, useState } from 'react';
import { UpgradeModal } from './UpgradeModal';

export function UsageBar({ used, limit }: { used: number; limit: number }) {
  const [open, setOpen] = useState(false);
  const lastCloseAt = useRef<number>(0);
  const ratio = Math.min(used / limit, 1);
  const isWarning = ratio >= 0.6;
  const isDanger = ratio >= 1;

  return (
    <>
      <div
        onClick={() => {
          // Prevent accidental re-open when clicking rapidly on the close button area.
          if (Date.now() - lastCloseAt.current < 350) return;
          setOpen(true);
        }}
        className="cursor-pointer group flex flex-col gap-1 w-48 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] p-2 hover:border-[var(--accent-primary)]/50 transition"
      >
        <div className="flex justify-between text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
          <span>{used} / {limit} free ideas used</span>
          <span className="font-medium text-[var(--accent-primary)] text-[10px] uppercase">Upgrade</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <div 
            className={`h-full transition-all duration-500 ${isDanger ? 'bg-[var(--destructive)]' : isWarning ? 'bg-amber-500' : 'bg-[var(--accent-primary)]'}`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
      <UpgradeModal
        open={open}
        onOpenChange={(v) => {
          if (!v) lastCloseAt.current = Date.now();
          setOpen(v);
        }}
      />
    </>
  );
}
