'use client';

import { motion } from 'framer-motion';
import {
  Mic,
  BarChart3,
  Search,
  Target,
  Wrench,
  Globe,
  Flame,
  ListChecks,
  Coins,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

const items = [
  { icon: Mic, title: 'Pitch Speech Generator', desc: 'Investor-ready narrative, hook to close.' },
  { icon: BarChart3, title: 'Market Research', desc: 'TAM/SAM/SOM, trends, and risks.' },
  { icon: Search, title: 'Competitor Intelligence', desc: 'Landscape, gaps, differentiation.' },
  { icon: Target, title: 'Success Probability Score', desc: '8 dimensions, honest verdict.' },
  { icon: Wrench, title: 'Feature Roadmap', desc: 'MVP → V1 → V2 with estimates.' },
  { icon: Globe, title: 'Domain Name Finder', desc: 'Brandable names with rationale.' },
  { icon: Flame, title: 'Roast My Idea Mode', desc: 'VC-grade skepticism + rebuttals.' },
  { icon: ListChecks, title: 'Validation Checklist', desc: 'Phased tasks before you build.' },
  { icon: Coins, title: 'Monetization Strategy', desc: 'Models, fit scores, projections.' },
  { icon: Users, title: 'Team & Budget Planner', desc: 'Roles, salaries, burn scenarios.' },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
          Everything you need to validate and pitch your idea
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--text-secondary)]">
          Twelve AI modules work together so you leave with a complete package.
        </p>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group h-full p-6 hover:border-[var(--accent-primary)]/40">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-glow)] text-[var(--accent-primary)] transition group-hover:glow-pulse">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
