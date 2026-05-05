'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import type { Variants } from 'framer-motion';
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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const pointerGlow = useMotionTemplate`radial-gradient(1200px circle at ${springX}px ${springY}px, rgba(124, 110, 250, 0.08), transparent 40%)`;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring' as const, stiffness: 80, damping: 20 },
    },
  };

  const titleWords1 = 'Turn Your Idea Into'.split(' ');
  const titleWords2 = 'An Investor-Ready'.split(' ');
  const titleWords3 = 'Package'.split(' ');
  const [slide, setSlide] = useState(0);
  const [stats, setStats] = useState({ totalUsers: 0, totalAnalyses: 0, avgScore: 0 });

  const slides = useMemo(
    () => [
      {
        title: 'Success Score',
        subtitle: 'Live analysis preview',
        body: 'Overall score: 74/100\nStrong timing, clear monetization path, and high implementation feasibility.',
        accent: 'from-emerald-400/35 to-indigo-500/20',
      },
      {
        title: 'Pitch Speech',
        subtitle: 'Live analysis preview',
        body: 'Problem: SMEs waste hours in manual billing.\nSolution: AI-first invoicing + auto follow-ups + payment predictions.',
        accent: 'from-violet-400/35 to-cyan-400/20',
      },
      {
        title: 'Competitor Analysis',
        subtitle: 'Live analysis preview',
        body: 'Gap found: fast India-specific onboarding and GST-first UX is still underserved by top incumbents.',
        accent: 'from-amber-400/35 to-fuchsia-500/20',
      },
    ],
    []
  );

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) =>
        setStats({
          totalUsers: Number(d.totalUsers ?? 0),
          totalAnalyses: Number(d.totalAnalyses ?? 0),
          avgScore: Number(d.avgScore ?? 0),
        })
      )
      .catch(() => {
        // ignore, keep zero defaults
      });
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden pt-24 pb-20 bg-[#0A0A0B]">
      {/* 1. Cinematic Animated Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-screen opacity-70">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -left-[10%] h-[120%] w-[80%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.1),transparent_60%)] blur-[80px]"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.3, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[10%] -right-[10%] h-[140%] w-[100%] rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_60%)] blur-[100px]"
        />
        <motion.div
          style={{ backgroundImage: pointerGlow }}
          className="absolute inset-0"
        />
        {/* Sleek Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, var(--border-bright) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          
          <motion.div variants={itemVariants} className="mb-8 inline-block">
            <Badge variant="accent" className="gap-2 border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 backdrop-blur-md px-4 py-2 font-mono tracking-widest shadow-[0_0_20px_rgba(124,110,250,0.2)]">
              <Sparkles className="h-4 w-4" />
              AI-Powered Startup Analysis
            </Badge>
          </motion.div>

          {/* 2. Kinetic Typography Heading */}
          <h1 className="font-display text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            <div className="overflow-hidden pb-2 flex justify-center flex-wrap gap-x-4">
              {titleWords1.map((word, i) => (
                <motion.span
                  key={`w1-${i}`}
                  variants={itemVariants}
                  className="inline-block drop-shadow-md"
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <div className="overflow-hidden pb-2 flex justify-center flex-wrap gap-x-4 mt-2">
              {titleWords2.map((word, i) => (
                <motion.span
                  key={`w2-${i}`}
                  variants={itemVariants}
                  className="inline-block bg-gradient-to-r from-[#A855F7] to-[#38BDF8] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                >
                  {word}
                </motion.span>
              ))}
              {titleWords3.map((word, i) => (
                <motion.span
                  key={`w3-${i}`}
                  variants={itemVariants}
                  className="inline-block drop-shadow-md"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-2xl text-lg font-light text-white/70 sm:text-xl leading-relaxed"
          >
            Pitch speech, market research, competitor analysis, success probability, UI flows, budget
            breakdown — all generated in under 2 minutes.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={onAnalyze} className="min-w-[220px] h-14 text-lg bg-gradient-to-r from-[#7C6EFA] to-[#38BDF8] hover:opacity-90 shadow-[0_0_40px_rgba(124,110,250,0.5)] border-0">
                Analyze My Idea →
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="lg" onClick={onExample} className="h-14 text-lg border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                See Example
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-8 text-sm text-white/50">
            <span>
              <strong className="text-white">{stats.totalUsers}+</strong> founders
            </span>
            <span className="h-4 w-px bg-white/20" />
            <span>
              <strong className="text-white">{stats.totalAnalyses}+</strong> ideas analyzed
            </span>
            <span className="h-4 w-px bg-white/20" />
            <span>
              Avg score: <strong className="text-white">{stats.avgScore}</strong>
            </span>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-8 text-sm font-medium text-white/40 tracking-wide uppercase">
            Free to start · No credit card · ~60–90s analysis
          </motion.p>

          {/* 3. Real preview carousel */}
          <motion.div
            variants={itemVariants}
            className="relative mx-auto mt-20 md:mt-28 max-w-4xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#111118]/80 to-[#0A0A0B]/90 p-1 shadow-[0_0_80px_rgba(124,110,250,0.2)] backdrop-blur-2xl"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="relative overflow-hidden rounded-[1.8rem] bg-[#0A0A0B] p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="text-left"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-white/50">{slides[slide].subtitle}</p>
                    <div className="flex gap-1.5">
                      {slides.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-6 rounded-full ${i === slide ? 'bg-white/80' : 'bg-white/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${slides[slide].accent} p-6`}>
                    <h3 className="text-2xl font-bold text-white">{slides[slide].title}</h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/85">{slides[slide].body}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[#111118] px-6 py-2 shadow-xl backdrop-blur-xl">
              <p className="text-sm font-medium text-white/50 tracking-wider">
                LIVE ANALYSIS PREVIEW
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
