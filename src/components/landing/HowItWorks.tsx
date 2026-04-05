'use client';

import { motion } from 'framer-motion';
import { PenLine, Cpu, Package } from 'lucide-react';

const steps = [
  {
    n: '01',
    title: 'Describe Your Idea',
    desc: 'Type a few sentences — messy notes are fine. We need the problem, who it’s for, and what you’re building.',
    icon: PenLine,
  },
  {
    n: '02',
    title: 'AI Analyzes Everything',
    desc: 'Thirteen modules run in parallel: market, competitors, pitch, score, UI flow, deck, and more.',
    icon: Cpu,
  },
  {
    n: '03',
    title: 'Get Your Package',
    desc: 'Browse the results dashboard, download your pitch deck, and share when you’re ready.',
    icon: Package,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 border-y border-[var(--border)] bg-[var(--bg-secondary)] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
          How it works
        </h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              className="relative text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {i < steps.length - 1 ? (
                <div className="absolute left-1/2 top-8 hidden h-px w-full bg-gradient-to-r from-[var(--accent-primary)]/50 to-transparent md:left-[60%] md:block md:w-[80%]" />
              ) : null}
              <div className="font-display mb-4 inline-block bg-gradient-to-br from-[#7C6EFA] to-[#A855F7] bg-clip-text text-5xl font-extrabold text-transparent">
                {s.n}
              </div>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-glow)] text-[var(--accent-primary)] md:mx-0">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
