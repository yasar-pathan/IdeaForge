'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Hero } from './Hero';
import { Features } from './Features';
import { ScrollNarrative } from './ScrollNarrative';
import { Pricing } from './Pricing';
import { Footer } from '@/components/layout/Footer';
import { IdeaForgeModal } from './IdeaForgeModal';

function OpenForgeFromQuery({ onOpen }: { onOpen: () => void }) {
  const sp = useSearchParams();
  useEffect(() => {
    if (sp.get('forge') === '1') onOpen();
  }, [sp, onOpen]);
  return null;
}

export function LandingPage() {
  const [modal, setModal] = useState(false);

  return (
    <div className="page-transition relative z-[1]">
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
