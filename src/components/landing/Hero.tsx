'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate, Variants } from 'framer-motion';
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

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 80, damping: 20 },
    },
  };

  const titleWords1 = 'Turn Your Idea Into'.split(' ');
  const titleWords2 = 'An Investor-Ready'.split(' ');
  const titleWords3 = 'Package'.split(' ');

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

          <motion.p variants={itemVariants} className="mt-8 text-sm font-medium text-white/40 tracking-wide uppercase">
            Free to start · No credit card · ~60–90s analysis
          </motion.p>

          {/* 3. Animated Dashboard Skeleton */}
          <motion.div
            variants={itemVariants}
            className="relative mx-auto mt-20 md:mt-28 max-w-4xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#111118]/80 to-[#0A0A0B]/90 p-1 shadow-[0_0_80px_rgba(124,110,250,0.2)] backdrop-blur-2xl"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <div className="rounded-[1.8rem] bg-[#0A0A0B] p-6 lg:p-8 relative overflow-hidden">
              {/* Scanline effect rendering over UI */}
              <motion.div 
                initial={{ top: '-100%' }}
                animate={{ top: '200%' }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#7C6EFA]/10 to-transparent z-20 pointer-events-none"
              />

              <div className="flex items-center gap-3 mb-8">
                <div className="flex gap-1.5 border border-white/10 p-1.5 rounded-lg">
                   <div className="w-3 h-3 rounded-full bg-red-400/80" />
                   <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                   <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="h-4 w-40 rounded-full bg-white/5" />
              </div>

              <div className="grid grid-cols-12 gap-6 text-left">
                {/* Sidebar */}
                <div className="col-span-3 space-y-4 hidden md:block border-r border-white/5 pr-6">
                  <div className="flex items-center gap-3"><div className="h-6 w-6 rounded bg-[#7C6EFA]/30"/><div className="h-4 w-24 rounded bg-white/10" /></div>
                  <div className="flex items-center gap-3 opacity-50"><div className="h-6 w-6 rounded bg-white/5"/><div className="h-4 w-20 rounded bg-white/5" /></div>
                  <div className="flex items-center gap-3 opacity-50"><div className="h-6 w-6 rounded bg-white/5"/><div className="h-4 w-16 rounded bg-white/5" /></div>
                </div>

                {/* Main Content Area */}
                <div className="col-span-12 md:col-span-9 space-y-6">
                  <div className="space-y-3">
                    {/* Animated Lines representing text generation */}
                    <motion.div initial={{ width: "0%" }} animate={{ width: "80%" }} transition={{ duration: 1.5, delay: 1, ease: "easeOut" }} className="h-6 md:h-8 rounded-lg bg-gradient-to-r from-white/10 to-transparent" />
                    <motion.div initial={{ width: "0%" }} animate={{ width: "40%" }} transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }} className="h-6 md:h-8 rounded-lg bg-white/5" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 1.8 + i * 0.2, type: 'spring' }}
                        className="h-24 md:h-32 rounded-2xl bg-white/5 ring-1 ring-white/10 flex flex-col justify-end p-4 relative overflow-hidden"
                      >
                         {/* Card content skeleton */}
                         <div className="h-2 w-1/2 rounded-full bg-white/10 mb-2" />
                         <div className="h-2 w-full rounded-full bg-white/5" />
                         <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/5" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[#111118] px-6 py-2 shadow-xl backdrop-blur-xl">
              <p className="text-sm font-medium text-white/50 tracking-wider">
                LIVE DASHBOARD PREVIEW
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
