'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, BarChart3, Rocket, Target, Award, Compass, Zap } from 'lucide-react';

const FACTS = [
  {
    text: "Airbnb's founders funded their initial launch by selling custom cereal boxes during the 2008 election.",
    category: "Resilience",
    icon: Rocket,
  },
  {
    text: "The term 'Unicorn' was coined in 2013 to describe startups valued over $1B. Back then, there were only 39.",
    category: "History",
    icon: Target,
  },
  {
    text: "Over 50% of Fortune 500 companies were founded during a recession or bear market.",
    category: "Opportunity",
    icon: BarChart3,
  },
  {
    text: "Slack started as an internal communication tool for a gaming startup called Tiny Speck.",
    category: "Pivot",
    icon: Lightbulb,
  },
  {
    text: "Instagram was originally a check-in app called Burbn, but was simplified to focus only on photos.",
    category: "Pivot",
    icon: Zap,
  },
  {
    text: "Amazon was originally called Cadabra, but Jeff Bezos changed it to avoid sounding like 'cadaver'.",
    category: "Branding",
    icon: Compass,
  },
  {
    text: "93% of successful startups changed their initial idea. Adaptability is key!",
    category: "Strategy",
    icon: Target,
  },
  {
    text: "Angry Birds was Rovio's 52nd game. The previous 51 games did not achieve major commercial success.",
    category: "Perseverance",
    icon: Award,
  },
  {
    text: "Netflix was founded in 1997 after Reed Hastings was charged a $40 late fee for returning Apollo 13.",
    category: "Origin",
    icon: Lightbulb,
  },
  {
    text: "The average age of successful startup founders is 45. It's never too late to start.",
    category: "Demographics",
    icon: Award,
  },
  {
    text: "YouTube was originally designed as a video dating site called 'Tune In Hook Up'.",
    category: "Pivot",
    icon: Zap,
  },
  {
    text: "Pinterest's founder personally emailed the first 5,000 users to welcome them.",
    category: "Growth",
    icon: Rocket,
  },
  {
    text: "Figma was founded in 2012 and took four years to launch its first public tool. Quality takes time.",
    category: "Product",
    icon: Target,
  },
  {
    text: "The founder of FedEx saved the company in its early days by winning $27,000 playing blackjack in Vegas.",
    category: "Survival",
    icon: BarChart3,
  },
  {
    text: "Flickr began as a feature in an online multiplayer game before becoming a standalone photo site.",
    category: "Origin",
    icon: Compass,
  },
  {
    text: "Twitter's original logo cost only $15 from a stock photo website.",
    category: "Frugality",
    icon: Zap,
  },
  {
    text: "Shopify was created after its founders failed to find a good e-commerce platform for their snowboard shop.",
    category: "Origin",
    icon: Lightbulb,
  },
];

export function SmartFactsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FACTS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const currentFact = FACTS[index];
  const IconComponent = currentFact.icon;

  return (
    <div className="w-full rounded-2xl border border-[var(--border-bright)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7C6EFA] to-[#A855F7]" />
      
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent-primary)]">
          <IconComponent className="h-4.5 w-4.5" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Startup trivia • {currentFact.category}
        </span>
      </div>

      <div className="min-h-[50px] relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-sm leading-relaxed text-[var(--text-primary)]"
          >
            {currentFact.text}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[10px] text-[var(--text-muted)]">
        <span>💡 Occupy your mind while we forge</span>
        <div className="flex gap-1">
          {FACTS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === index ? 'w-4 bg-[var(--accent-primary)]' : 'w-1.5 bg-[var(--border-bright)]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
