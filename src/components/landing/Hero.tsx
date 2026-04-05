'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles } from 'lucide-react';

export function Hero({
  onAnalyze,
  onExample,
}: {
  onAnalyze: () => void;
  onExample: () => void;
}) {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden pt-24 pb-20 hero-glow">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,110,250,0.08),transparent_40%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, var(--border-bright) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-[1] mx-auto max-w-5xl px-4 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Badge variant="accent" className="mb-6 gap-1 border-[var(--accent-primary)]/50 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered Startup Analysis
          </Badge>
        </motion.div>

        <motion.h1
          className="font-display text-4xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          Turn Your Idea Into
          <br />
          <span className="gradient-text">An Investor-Ready</span> Package
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Pitch speech, market research, competitor analysis, success probability, UI flows, budget
          breakdown — all generated in under 2 minutes.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button size="lg" onClick={onAnalyze} className="min-w-[220px]">
            Analyze My Idea →
          </Button>
          <Button variant="secondary" size="lg" onClick={onExample}>
            See Example
          </Button>
        </motion.div>

        <p className="mt-6 text-sm text-[var(--text-muted)]">
          Free to start · No credit card · ~60–90s analysis
        </p>

        <motion.div
          className="relative mx-auto mt-16 max-w-3xl rounded-[var(--radius-xl)] border border-[var(--border-bright)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-elevated)] p-8 shadow-[var(--shadow-glow)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="absolute inset-0 rounded-[var(--radius-xl)] bg-[var(--accent-glow)] blur-3xl" />
          <div className="relative space-y-3 text-left blur-[0.5px]">
            <div className="flex gap-2">
              <div className="h-2 w-20 rounded-full bg-[var(--accent-primary)]/40" />
              <div className="h-2 w-12 rounded-full bg-[var(--border)]" />
            </div>
            <div className="h-3 w-3/4 max-w-md rounded bg-[var(--border)]" />
            <div className="h-3 w-full max-w-lg rounded bg-[var(--border)]/80" />
            <div className="grid grid-cols-3 gap-2 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-[var(--bg-secondary)] ring-1 ring-[var(--border)]" />
              ))}
            </div>
          </div>
          <p className="relative mt-4 text-center text-xs text-[var(--text-muted)]">
            Preview of your analysis dashboard
          </p>
        </motion.div>
      </div>
    </section>
  );
}
