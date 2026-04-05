'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { MODULE_ORDER } from '@/lib/modules';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { DownloadBar } from '@/components/results/DownloadBar';
import { SuccessScoreCard } from './modules/SuccessScoreCard';
import { PitchSpeechCard } from './modules/PitchSpeechCard';
import { MarketResearchCard } from './modules/MarketResearchCard';
import { CompetitorCard } from './modules/CompetitorCard';
import { FeaturesCard } from './modules/FeaturesCard';
import { DomainCard } from './modules/DomainCard';
import { RoastCard } from './modules/RoastCard';
import { ChecklistCard } from './modules/ChecklistCard';
import { MonetizationCard } from './modules/MonetizationCard';
import { TeamCard } from './modules/TeamCard';
import { BudgetCard } from './modules/BudgetCard';
import { UIFlowCard } from './modules/UIFlowCard';

export function ResultsDashboard({ sessionId }: { sessionId: string }) {
  const { data, isLoading, error, refetch } = useSession(sessionId, true);
  const [active, setActive] = useState('success');
  const [mobileNav, setMobileNav] = useState(false);
  const session = (data?.session as Record<string, unknown>) ?? null;
  const status = String(session?.status ?? '');
  const title = String(session?.idea_title ?? 'Your analysis');
  const category = String(session?.idea_category ?? '');
  const scoreRow = data?.success_probability as Record<string, unknown> | null | undefined;
  const overall = Number(scoreRow?.overall_score ?? 0);

  useEffect(() => {
    if (status !== 'processing') return;
    const t = setInterval(() => refetch(), 2000);
    return () => clearInterval(t);
  }, [status, refetch]);

  const hashScrolledRef = useRef(false);
  useEffect(() => {
    if (!data || hashScrolledRef.current) return;
    const id = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    if (!id) return;
    hashScrolledRef.current = true;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
    return () => window.clearTimeout(t);
  }, [data]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id);
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    MODULE_ORDER.forEach(({ sectionId }) => {
      const el = document.getElementById(sectionId);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [data, status]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileNav(false);
  };

  if (isLoading && !data) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-32 pt-24">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 pt-24">
        <p className="text-[var(--danger)]">{error || 'Not found'}</p>
        <Link href="/dashboard" className="mt-4 text-[var(--accent-primary)]">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 pt-24">
        <p className="text-[var(--text-secondary)]">Analysis failed.</p>
        <Link href="/" className="mt-4">
          <Button variant="secondary">Home</Button>
        </Link>
      </div>
    );
  }

  const sp = data.success_probability as Record<string, unknown> | null;
  const pitch = data.pitch_speech as Record<string, unknown> | null;
  const market = data.market_research as Record<string, unknown> | null;
  const comp = data.competitor_intelligence as Record<string, unknown> | null;
  const feat = data.feature_recommendations as Record<string, unknown> | null;
  const dom = data.domain_suggestions as Record<string, unknown> | null;
  const roast = data.roast_analysis as Record<string, unknown> | null;
  const check = data.validation_checklist as Record<string, unknown> | null;
  const mon = data.monetization_strategies as Record<string, unknown> | null;
  const team = data.team_structure as Record<string, unknown> | null;
  const budget = data.budget_breakdown as Record<string, unknown> | null;
  const ui = data.ui_flow as Record<string, unknown> | null;

  return (
    <div className="pb-36 pt-20">
      <header className="sticky top-16 z-[70] border-b border-[var(--border)] bg-[rgba(4,4,10,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="truncate font-display font-bold text-[var(--text-primary)]">{title}</p>
              {category ? (
                <Badge variant="accent" className="mt-1 text-[10px]">
                  {category}
                </Badge>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] p-2 lg:hidden"
            onClick={() => setMobileNav((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {status === 'processing' ? (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="rounded-xl border border-[var(--border-bright)] bg-[var(--accent-glow)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)]">In progress:</span> generate more sections from the{' '}
            <Link href={`/workspace/${sessionId}`} className="font-medium text-[var(--accent-primary)] hover:underline">
              workspace
            </Link>
            . Anything you have already generated appears below.
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-7xl gap-8 px-4 pt-8">
        <aside
          className={`fixed inset-y-0 left-0 z-[65] w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-4 pt-28 transition-transform lg:static lg:z-0 lg:block lg:bg-transparent lg:p-0 lg:pt-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <nav className="sticky top-32 space-y-1">
            {MODULE_ORDER.map(({ sectionId, label, icon }) => (
              <button
                key={sectionId}
                type="button"
                onClick={() => scrollTo(sectionId)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  active === sectionId
                    ? 'border-l-2 border-[var(--accent-primary)] bg-[var(--accent-glow)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{icon}</span>
                <span className="flex-1 truncate">{label}</span>
                {sectionId === 'success' && overall ? (
                  <span className="font-mono text-xs text-[var(--accent-primary)]">{overall}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>

        {mobileNav ? (
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
          />
        ) : null}

        <motion.div
          data-pdf-root
          className="min-w-0 flex-1 space-y-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SuccessScoreCard data={sp} />
          <PitchSpeechCard data={pitch} />
          <MarketResearchCard data={market} />
          <CompetitorCard data={comp} />
          <FeaturesCard data={feat} />
          <DomainCard data={dom} />
          <RoastCard data={roast} />
          <ChecklistCard data={check} sessionId={sessionId} />
          <MonetizationCard data={mon} />
          <TeamCard data={team} />
          <BudgetCard data={budget} />
          <UIFlowCard data={ui} />
        </motion.div>
      </div>

      <DownloadBar sessionId={sessionId} ideaTitle={title} />
    </div>
  );
}
