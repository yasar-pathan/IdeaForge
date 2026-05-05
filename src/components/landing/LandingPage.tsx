'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Hero } from './Hero';
import { Features } from './Features';
import { ScrollNarrative } from './ScrollNarrative';
import { Pricing } from './Pricing';
import { Footer } from '@/components/layout/Footer';
import { IdeaForgeModal } from './IdeaForgeModal';
import { useAnalysis } from '@/hooks/useAnalysis';
import { usePendingIdea } from '@/hooks/usePendingIdea';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { UpgradeModal } from '@/components/ui/UpgradeModal';

function OpenForgeFromQuery({ onOpen }: { onOpen: () => void }) {
  const sp = useSearchParams();
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current) return;
    if (sp.get('forge') === '1') {
      openedRef.current = true;
      onOpen();
    }
  }, [sp, onOpen]);
  return null;
}

export function LandingPage() {
  const [modal, setModal] = useState(false);
  const [upgrade, setUpgrade] = useState<{ open: boolean; plan: 'pro' | 'founder' }>({ open: false, plan: 'pro' });
  const { submit } = useAnalysis();
  const { get, clear } = usePendingIdea();

  useEffect(() => {
    const pending = get();
    if (pending) {
      const checkAuth = async () => {
        const supabase = createBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          clear();
          await submit(pending);
        }
      };
      checkAuth();
    }
  }, [get, clear, submit]);

  useEffect(() => {
    const onOpenUpgrade = (e: Event) => {
      const ce = e as CustomEvent<{ plan?: 'pro' | 'founder' }>;
      setUpgrade({ open: true, plan: ce.detail?.plan ?? 'pro' });
    };
    window.addEventListener('ideaforge:open-upgrade', onOpenUpgrade as EventListener);
    return () => window.removeEventListener('ideaforge:open-upgrade', onOpenUpgrade as EventListener);
  }, []);

  return (
    <div className="page-transition relative z-[1]">
      <UpgradeModal
        open={upgrade.open}
        onOpenChange={(v) => setUpgrade((p) => ({ ...p, open: v }))}
        defaultPlan={upgrade.plan}
      />
      <Suspense fallback={null}>
        <OpenForgeFromQuery onOpen={() => setModal(true)} />
      </Suspense>
      <Hero
        onAnalyze={() => setModal(true)}
        onExample={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
      />
      <Features />
      <ScrollNarrative />
      <Pricing />
      <Footer />
      <IdeaForgeModal open={modal} onOpenChange={setModal} />
    </div>
  );
}
