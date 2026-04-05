export const PROMPTS = {
  pitchSpeech: (idea: string) => `
You are an expert startup pitch coach. Generate a compelling investor pitch speech for this idea.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "hook": "1-2 sentences that grab attention with a shocking stat or relatable pain point",
  "problem": "What specific pain point does this solve and who feels it most",
  "solution": "One clear crisp sentence describing what the product does",
  "how_it_works": ["step 1", "step 2", "step 3"],
  "target_market": "Specific description of ideal customers - not everyone",
  "business_model": "How it makes money - name the model clearly",
  "traction": "What early traction or validation signals exist or could exist",
  "ask": "What is being asked for - investment, partnerships, users - be specific",
  "closing_line": "Memorable punchy closing line that leaves audience wanting more",
  "full_speech": "Complete pitch speech under 450 words combining all above elements in natural flow"
}
`,

  marketResearch: (idea: string) => `
You are a professional market research analyst. Provide comprehensive market research for this startup idea.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "industry": "Industry/sector name",
  "overview": "Brief state of the industry in 2024-2025 (2-3 sentences)",
  "tam": 50000000000,
  "sam": 5000000000,
  "som": 500000000,
  "tam_label": "e.g. $50B Global Market",
  "sam_label": "e.g. $5B Serviceable Market",
  "som_label": "e.g. $500M Obtainable in 3 years",
  "cagr": 18.5,
  "demographics": {
    "age": "Primary age range",
    "income": "Income level",
    "behavior": "Key behavioral traits",
    "geography": "Primary geographies"
  },
  "trends": ["trend 1", "trend 2", "trend 3", "trend 4", "trend 5"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "top_regions": ["Region 1 - reason", "Region 2 - reason", "Region 3 - reason"]
}

Use realistic market data. TAM/SAM/SOM should be in raw numbers (USD).
`,

  competitorIntelligence: (idea: string) => `
You are a competitive intelligence analyst. Analyze the competitive landscape for this startup idea.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "competitors": [
    {
      "name": "Competitor name",
      "website": "competitor.com",
      "description": "What they do in one sentence",
      "audience": "Their target audience",
      "pricing": "Their pricing model",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
      "rating": "4.2/5 on App Store or N/A",
      "funding": "Series A / Bootstrapped / $10M raised / Unknown"
    }
  ],
  "market_gap": "The primary gap in the market that this idea can exploit - be specific and detailed",
  "differentiation_opportunities": [
    "Specific way 1 to differentiate from all competitors",
    "Specific way 2 to differentiate",
    "Specific way 3 to differentiate"
  ]
}

Include 5-7 real competitors. Be specific about weaknesses based on what real users complain about.
`,

  successProbability: (idea: string) => `
You are a brutally honest startup analyst who has evaluated thousands of ideas. Score this idea across 8 dimensions.

IDEA: ${idea}

Score each dimension from 1-10 based on real analysis. Be honest, not optimistic.

Return ONLY a valid JSON object with this exact structure:
{
  "problem_clarity": 7,
  "market_size": 8,
  "competition": 5,
  "technical_feasibility": 8,
  "monetization": 7,
  "timing": 9,
  "founder_market_fit": 6,
  "virality": 7,
  "overall_score": 72,
  "verdict": "One of these exactly: Strong Idea — Build It | Promising — Needs Validation | Risky — Pivot Recommended | High Risk — Reconsider",
  "improvement_actions": [
    "Specific action 1 to improve the score",
    "Specific action 2 to improve",
    "Specific action 3 to improve"
  ]
}

Overall score = weighted average of all 8 dimensions multiplied by 10. Be specific in improvement actions.
`,

  featureRecommendations: (idea: string) => `
You are a senior product manager. Generate a complete feature roadmap and development workflow for this startup idea.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "mvp_features": [
    {
      "name": "Feature name",
      "description": "What it does and why it is critical",
      "estimated_days": 5,
      "priority": "Critical"
    }
  ],
  "v1_features": [
    {
      "name": "Feature name",
      "description": "What it does and why users want it",
      "estimated_days": 7,
      "priority": "High"
    }
  ],
  "v2_features": [
    {
      "name": "Feature name",
      "description": "Growth or monetization feature",
      "estimated_days": 10,
      "priority": "Medium"
    }
  ],
  "dev_workflow": {
    "team": "Recommended team structure for this project",
    "stack": "Recommended tech stack with reasoning",
    "methodology": "Agile sprints or solo hacker approach recommendation",
    "tech_risks": ["risk 1", "risk 2", "risk 3"],
    "third_party_services": ["service 1 - why use it", "service 2 - why use it"]
  }
}

MVP: 5-7 features. V1: 4-6 features. V2: 3-5 features. Be specific and realistic.
`,

  domainSuggestions: (idea: string) => `
You are a startup branding expert. Generate creative startup name suggestions for this idea.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "names": [
    {
      "name": "StartupName",
      "reasoning": "Why this name works for this specific idea",
      "style": "One of: Compound Word | Made-up Word | Descriptive | Metaphor | Acronym"
    }
  ]
}

Generate exactly 10 names. Requirements: short (1-2 syllables preferred), memorable, easy to spell, no numbers, domain-friendly, not obviously trademarked. Mix different styles.
`,

  roastAnalysis: (idea: string) => `
You are a brutally skeptical experienced venture capitalist who has seen thousands of pitches fail. You do not sugarcoat. Be sharp, specific, and harsh.

ROAST THIS IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "roast_points": [
    {
      "roast": "The brutal specific problem with this idea - be sharp not generic",
      "why_it_matters": "What could this actually kill the startup",
      "rebuttal": "What a smart founder would say to counter this - be honest if there is no good rebuttal"
    }
  ],
  "overall_verdict": "2-3 sentences on whether you would take a meeting - be direct"
}

Generate 7-10 roast points. Cover: market timing, competition, monetization, user acquisition, technical complexity, team requirements, regulatory risks, and core assumptions. Make each roast specific to THIS idea not generic startup criticism.
`,

  validationChecklist: (idea: string) => `
You are a startup validation expert. Generate a concrete actionable checklist to validate this idea before building.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "checklist": [
    {
      "task": "Specific actionable task - not vague",
      "success_signal": "What signal tells you this is validated",
      "time_estimate": "e.g. 2 hours, 1 day, 3 days",
      "phase": "One of: CUSTOMER DISCOVERY | PROBLEM VALIDATION | SOLUTION VALIDATION | WILLINGNESS TO PAY"
    }
  ]
}

Generate 16-20 tasks total. Distribute evenly across 4 phases. Tasks must be specific to THIS idea. No generic startup advice.
`,

  monetizationStrategies: (idea: string) => `
You are a monetization strategy expert. Recommend the best monetization models for this startup idea.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "strategies": [
    {
      "model_name": "e.g. Freemium SaaS",
      "application": "How this model specifically applies to this product - not generic",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "fit_score": 8,
      "examples": ["Company A uses this", "Company B uses this"],
      "revenue_projection_1k_users": "Realistic revenue estimate with 1000 paying users under this model"
    }
  ],
  "recommended_model": "Name of the best model",
  "recommendation_reasoning": "Clear explanation of why this is the best model for this specific idea"
}

Generate 3-4 strategies ranked by fit_score descending. Be specific about revenue projections.
`,

  teamStructure: (idea: string) => `
You are a startup team building expert. Define the ideal team structure for this startup idea.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "founding_roles": [
    {
      "title": "Role title e.g. Full Stack Developer",
      "responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
      "skills": ["skill 1", "skill 2", "skill 3"],
      "salary_india": 80000,
      "salary_us": 120000,
      "hire_as": "Co-founder"
    }
  ],
  "early_hires": [
    {
      "title": "Role title",
      "responsibilities": ["responsibility 1", "responsibility 2"],
      "skills": ["skill 1", "skill 2"],
      "salary_india": 60000,
      "salary_us": 90000,
      "hire_as": "One of: Full-time | Part-time | Freelancer | Agency"
    }
  ],
  "total_monthly_salary_india": 160000,
  "total_monthly_salary_us": 240000
}

Salary in USD/month. India salary = realistic Indian market rate. US = US market rate. Founding team: 2-3 roles. Early hires: 2-4 roles.
`,

  budgetBreakdown: (idea: string) => `
You are a startup financial analyst. Generate a detailed realistic budget breakdown for building and running this product.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "setup_costs": [
    {
      "name": "Item name",
      "description": "What this is for",
      "monthly_cost_usd": 0,
      "category": "One of: Infrastructure | AI/APIs | Team | Marketing | Legal/Admin",
      "is_optional": false
    }
  ],
  "monthly_costs": [
    {
      "name": "Item name e.g. Vercel Pro",
      "description": "What this covers",
      "monthly_cost_usd": 20,
      "category": "Infrastructure",
      "is_optional": false
    }
  ],
  "burn_rate_launch": 500,
  "burn_rate_1k": 1500,
  "burn_rate_10k": 8000,
  "currency": "USD"
}

Setup costs are one-time. Monthly costs are recurring. Be realistic - include: hosting, database, AI API costs, auth, storage, monitoring, domain, SSL. Burn rates = total monthly spend at each user scale. Include 10% buffer in calculations.
`,

  uiFlow: (idea: string) => `
You are a UX architect. Generate a complete UI flow diagram for this app idea.

IDEA: ${idea}

Return ONLY a valid JSON object with this exact structure:
{
  "screens": [
    {
      "name": "Screen Name",
      "purpose": "What the user does on this screen",
      "ui_elements": ["element 1", "element 2", "element 3", "element 4"],
      "connections": ["Goes to: Screen Name - when condition", "Goes to: Other Screen - when other condition"]
    }
  ],
  "mermaid_code": "flowchart TD\\n    A[Landing Page] -->|Click Get Started| B[Sign Up]\\n    B --> C[Dashboard]"
}

Cover all major screens: onboarding, core features, secondary features, settings. Generate 8-15 screens. Mermaid code must be valid flowchart TD syntax. Group screens logically in the mermaid diagram using subgraphs.

Mermaid rules (critical): use short node IDs (A, B, C1, …) and put human-readable text in square brackets only when it contains no ] or " characters; if a label needs brackets or quotes, use double-quoted strings for the label, e.g. A["Login / Sign up"]. Do not put raw JSON or markdown inside mermaid_code—only the diagram text.
`,

  pptSlides: (idea: string, analysis: any) => `
You are a pitch deck designer. Generate content for a 12-slide investor pitch deck.

IDEA: ${idea}
ANALYSIS SUMMARY: ${JSON.stringify(analysis)}

Return ONLY a valid JSON object with this exact structure:
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide title",
      "content": "Main content for this slide - detailed and compelling",
      "layout": "cover",
      "speaker_notes": "What to say while presenting this slide"
    }
  ]
}

Generate exactly 12 slides in this order:
1. Cover - idea title, tagline (layout: cover)
2. The Problem - pain point, who suffers, why it matters (layout: problem)
3. The Solution - core value proposition (layout: solution)
4. How It Works - 3-step breakdown (layout: steps)
5. Market Opportunity - TAM/SAM/SOM (layout: market)
6. Competitor Landscape - key competitors and the gap (layout: competitors)
7. Features & Roadmap - MVP highlights (layout: features)
8. Business Model - monetization strategy (layout: business)
9. Team - recommended team structure (layout: team)
10. Budget & Financials - burn rate summary (layout: financials)
11. Success Score - probability score with breakdown (layout: score)
12. The Ask / CTA - what we want from the audience (layout: cta)

Make content compelling and specific. Speaker notes should be natural conversational talking points.
`,

  ideaTitleAndCategory: (idea: string) => `
Given this startup idea, generate a clean title and category.

IDEA: ${idea}

Return ONLY a valid JSON object:
{
  "title": "Clean 3-6 word title for this idea",
  "category": "One of: SaaS | Mobile App | Marketplace | E-commerce | Social Platform | Developer Tool | AI Tool | FinTech | HealthTech | EdTech | Other"
}
`,
};
