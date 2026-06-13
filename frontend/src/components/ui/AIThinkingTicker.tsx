'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MODULE_PHRASES: Record<string, string[]> = {
  success_probability: [
    "Calibrating neural market viability models...",
    "Analyzing statistical success ratios in this vertical...",
    "Evaluating idea risk factors and mitigation parameters...",
    "Calculating baseline competitive index scores...",
    "Weighting consumer interest heuristics..."
  ],
  pitch_speech: [
    "Drafting compelling hook variations...",
    "Structuring persuasive storytelling frameworks...",
    "Formulating 1-minute elevator pitch scripts...",
    "Polishing tone parameters for venture capital audiences...",
    "Injecting emotional resonance hooks..."
  ],
  market_research: [
    "Ingesting global industry reports and sector trends...",
    "Calculating Total Addressable Market (TAM) estimates...",
    "Structuring Serviceable Obtainable Market (SOM) margins...",
    "Pinpointing target demographic segments...",
    "Mapping consumer behavior shifts and patterns..."
  ],
  competitor_intelligence: [
    "Conducting deep-web intelligence queries...",
    "Indexing direct and indirect competitor lists...",
    "Mapping competitor feature overlaps and product gaps...",
    "Extracting value proposition differentiators...",
    "Analyzing pricing models and competitive moats..."
  ],
  feature_recommendations: [
    "Prioritizing minimum viable product (MVP) specifications...",
    "Drafting phase 1 core features and user stories...",
    "Formulating long-term product roadmap milestones...",
    "Defining critical technology stack recommendations..."
  ],
  feature_suggestions: [
    "Brainstorming viral feedback loops and hook features...",
    "Synthesizing AI-powered feature extensions...",
    "Generating high-engagement interactive concepts...",
    "Optimizing retention-driving user action loops..."
  ],
  domain_suggestions: [
    "Querying domain naming suggestions and availability...",
    "Generating memorable, brandable name concepts...",
    "Evaluating phonetic strength and spelling indexes...",
    "Checking social media handle availability heuristics..."
  ],
  roast_analysis: [
    "Assembling critical feedback engine matrices...",
    "Analyzing blindspots and structural weaknesses...",
    "Formulating brutal but constructive market roasts...",
    "Highlighting hidden operational execution risks..."
  ],
  validation_checklist: [
    "Synthesizing real-world hypothesis validation steps...",
    "Designing user interview guides and feedback loops...",
    "Drafting pre-launch landing page experiments...",
    "Defining key metrics (KPIs) to track during launch..."
  ],
  monetization_strategies: [
    "Formulating premium pricing tier structures...",
    "Evaluating subscription vs transactional models...",
    "Designing creative recurring revenue channels...",
    "Calculating customer lifetime value (LTV) assumptions..."
  ],
  team_structure: [
    "Mapping optimal early-stage organizational chart...",
    "Defining critical initial hiring roles and skills...",
    "Drafting responsibilities for co-founder relationships...",
    "Designing equity split frameworks and vesting schedules..."
  ],
  budget_breakdown: [
    "Estimating early infrastructure and hosting costs...",
    "Calculating monthly burn rates and cash runway models...",
    "Allocating marketing and customer acquisition budgets...",
    "Structuring 12-month operational cost projections..."
  ],
  ui_flow: [
    "Mapping key onboarding user flow pathways...",
    "Defining critical database entity relationships...",
    "Sketching page-to-page navigation architecture...",
    "Optimizing checkout and conversion funnel steps..."
  ],
  ppt_slides: [
    "Creating 10-slide venture capitalist presentation outline...",
    "Structuring problem-solution slide narratives...",
    "Drafting financial projection slide guides...",
    "Designing download formatting layout parameters..."
  ]
};

const GENERAL_PHRASES = [
  "Structuring deep semantic representations...",
  "Querying knowledge repositories...",
  "Analyzing market viability graphs...",
  "Formatting synthesis blocks...",
  "Injecting expert domain heuristics..."
];

interface AIThinkingTickerProps {
  moduleId?: string | null;
}

export function AIThinkingTicker({ moduleId }: AIThinkingTickerProps) {
  const [phrases, setPhrases] = useState<string[]>(GENERAL_PHRASES);
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Update phrases when moduleId changes
  useEffect(() => {
    if (moduleId && MODULE_PHRASES[moduleId]) {
      setPhrases(MODULE_PHRASES[moduleId]);
    } else {
      setPhrases(GENERAL_PHRASES);
    }
    setIndex(0);
    setIsDeleting(false);
    setDisplayText('');
  }, [moduleId]);

  // Typewriter effect loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentFullText = phrases[index % phrases.length];
    
    const tick = () => {
      if (!isDeleting) {
        // Typing
        setDisplayText((prev) => currentFullText.slice(0, prev.length + 1));
        
        if (displayText === currentFullText) {
          // Pause when done typing
          timer = setTimeout(() => setIsDeleting(true), 2500);
          return;
        }
      } else {
        // Deleting
        setDisplayText((prev) => currentFullText.slice(0, prev.length - 1));
        
        if (displayText === '') {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % phrases.length);
          return;
        }
      }

      // Timing factors
      const delta = isDeleting ? 30 : 60 + Math.random() * 40;
      timer = setTimeout(tick, delta);
    };

    timer = setTimeout(tick, 100);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, phrases]);

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent-primary)] select-none">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]"></span>
      </span>
      <span>
        {displayText}
        <span className="animate-pulse font-bold">|</span>
      </span>
    </div>
  );
}
