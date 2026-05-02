'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, BrainCircuit, LineChart, Presentation, Target } from 'lucide-react';

export function ScrollNarrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  // Transform scroll into horizontal movement
  // Let's make it 4 sections of 100vw => total width 400vw.
  // We move from 0% to -75% to bring the 4th screen into view.
  const x = useTransform(smoothProgress, [0, 1], ['0%', '-75%']);

  return (
    <section ref={containerRef} className="relative h-[600vh] bg-[#030305]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        
        {/* The horizontal "Train" Track */}
        <motion.div 
          style={{ x }} 
          className="flex h-full w-[400vw] will-change-transform"
        >
          {/* SCENE 1: The Raw Dough */}
          <div className="flex h-full w-screen flex-col items-center justify-center px-4 relative flex-shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,110,250,0.1),transparent_60%)]" />
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ type: 'spring', bounce: 0.6, duration: 1.2 }}
              className="relative z-10 text-center"
            >
              <Badge variant="accent" className="mb-8 font-mono text-xs md:text-sm tracking-widest uppercase py-2 px-4 shadow-[0_0_20px_rgba(124,110,250,0.3)]">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                The Spark
              </Badge>
              <h2 className="font-display text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-tight">
                Ideas are <br />
                <span className="bg-gradient-to-r from-[#A855F7] to-[#7C6EFA] text-transparent bg-clip-text">plentiful.</span>
              </h2>
              <p className="mt-6 text-xl text-white/50 max-w-md mx-auto font-light">But without form, they fade away.</p>
              
              {/* Playful Floating Shapes */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                 <motion.div 
                   animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -top-10 -left-20 w-32 h-32 rounded-[40%] bg-[#A855F7]/20 blur-2xl"
                 />
                 <motion.div 
                   animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute bottom-10 -right-20 w-40 h-40 rounded-[30%] bg-[#38BDF8]/10 blur-[40px]"
                 />
              </div>
            </motion.div>
          </div>

          {/* SCENE 2: The Structure (Glassmorphism Cards sliding in) */}
          <div className="flex h-full w-screen items-center justify-center px-6 md:px-12 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(56,189,248,0.1),transparent_50%)]" />
            
            <motion.h2 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 0.15 }}
              transition={{ type: 'spring', duration: 1.5 }}
              className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 md:top-24 whitespace-nowrap font-display text-5xl md:text-7xl font-bold text-white z-0 pointer-events-none"
            >
              Systemizing the Chaos
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-6xl relative z-10 pt-20 md:pt-0">
              <motion.div 
                initial={{ x: 100, y: 100, rotate: -10, opacity: 0 }}
                whileInView={{ x: 0, y: 0, rotate: -2, opacity: 1 }}
                viewport={{ margin: "-10%" }}
                transition={{ type: 'spring', bounce: 0.4, duration: 1.5 }}
                className="col-span-1 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-10 shadow-2xl flex flex-col justify-end h-[300px] md:h-[400px]"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#38BDF8]/20 flex items-center justify-center mb-6">
                  <LineChart className="w-6 h-6 md:w-8 md:h-8 text-[#38BDF8]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Market Validation</h3>
                <p className="text-white/60 text-base md:text-lg">We shape your raw idea into solid numbers. TAM, SAM, SOM calculated instantly.</p>
              </motion.div>

              <motion.div 
                initial={{ x: 150, y: -50, rotate: 10, opacity: 0 }}
                whileInView={{ x: 0, y: 0, rotate: 2, opacity: 1 }}
                viewport={{ margin: "-10%" }}
                transition={{ type: 'spring', bounce: 0.4, duration: 1.5, delay: 0.2 }}
                className="col-span-1 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-10 shadow-2xl flex flex-col justify-end h-[300px] md:h-[400px] md:mt-24"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#34D399]/20 flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-[#34D399]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Competitor Insight</h3>
                <p className="text-white/60 text-base md:text-lg">Spot the gaps in the market before you write a single line of code.</p>
              </motion.div>
            </div>
          </div>

          {/* SCENE 3: The Pitch (Bouncy Typography) */}
          <div className="flex h-full w-screen items-center justify-center relative flex-shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)]" />
            
            <div className="text-center relative z-10 w-full px-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ margin: "-10%" }}
                transition={{ type: 'spring', damping: 15, mass: 1.5, stiffness: 100 }}
                className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-[30%] bg-gradient-to-br from-[#A855F7] to-[#7C6EFA] flex items-center justify-center shadow-[0_20px_50px_rgba(124,110,250,0.5)] mb-10 md:mb-12"
              >
                <Presentation className="w-10 h-10 md:w-16 md:h-16 text-white" />
              </motion.div>
              
              {/* Playful, bouncy letters for "THE PITCH" */}
              <div className="flex justify-center overflow-hidden py-4 w-full flex-wrap gap-x-2 gap-y-4">
                {"THE PITCH".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 80, opacity: 0, rotate: -10 }}
                    whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ type: 'spring', bounce: 0.7, duration: 1.2, delay: i * 0.08 }}
                    className="font-display font-black text-6xl sm:text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 inline-block drop-shadow-xl"
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </div>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ margin: "-10%" }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8 text-xl md:text-2xl text-white/70 max-w-xl mx-auto font-light leading-relaxed"
              >
                A compelling narrative, structured flawlessly. Ready to win over the toughest investors.
              </motion.p>
            </div>
          </div>

          {/* SCENE 4: The Finale */}
          <div className="flex h-full w-screen items-center justify-center relative flex-shrink-0">
            <motion.div 
               initial={{ scale: 0.8, opacity: 0, y: 50 }}
               whileInView={{ scale: 1, opacity: 1, y: 0 }}
               viewport={{ margin: "-20%" }}
               transition={{ type: 'spring', duration: 1.5, bounce: 0.4 }}
               className="text-center px-4"
            >
               <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40 mb-10">
                 <motion.div 
                   animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 rounded-[40%] border border-white/20 border-t-[#38BDF8] border-r-[#A855F7]" 
                 />
                 <motion.div 
                   animate={{ rotate: -360, scale: [1, 1.1, 1] }} 
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-2 md:inset-4 rounded-full border border-white/10 border-b-[#34D399]" 
                 />
                 <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-b from-[var(--bg-card)] to-transparent backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(124,110,250,0.3)]">
                   <BrainCircuit className="w-10 h-10 md:w-12 md:h-12 text-[#7C6EFA]" />
                 </div>
               </div>
               
               <h2 className="font-display text-4xl md:text-7xl font-bold tracking-tight text-white mb-6">
                 All in <span className="bg-gradient-to-r from-[#A855F7] to-[#7C6EFA] text-transparent bg-clip-text">Under 2 Minutes.</span>
               </h2>
               <p className="text-lg md:text-xl text-white/50 mb-12 max-w-lg mx-auto font-light">
                 The complete AI-powered architect for your next big thing. Let's make it real.
               </p>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
