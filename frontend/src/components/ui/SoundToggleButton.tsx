'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '@/frontend/lib/audio';
import { toast } from 'sonner';

export function SoundToggleButton({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  const toggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    setSoundEnabled(newVal);
    toast.success(newVal ? 'Chimes enabled 🔊' : 'Chimes muted 🔇', {
      duration: 2000,
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-bright)] bg-[var(--bg-card)] text-[var(--text-secondary)] shadow-sm hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-all ${className}`}
      title={enabled ? 'Mute chimes' : 'Unmute chimes'}
      aria-label={enabled ? 'Mute chimes' : 'Unmute chimes'}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
