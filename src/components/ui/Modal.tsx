'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[91] w-[min(92vw,560px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--border-bright)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className
          )}
        >
          <Dialog.Description className="sr-only">
            {title ? `${title} dialog` : 'Dialog'}
          </Dialog.Description>
          <div className="mb-4 flex items-center justify-between gap-4">
            {title ? (
              <Dialog.Title className="font-display text-lg font-bold text-[var(--text-primary)]">
                {title}
              </Dialog.Title>
            ) : (
              <span />
            )}
            <Dialog.Close
              className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
