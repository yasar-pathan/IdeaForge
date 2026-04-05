export type Plan = 'free' | 'pro' | 'team';
export type SessionStatus = 'processing' | 'complete' | 'failed';

export interface User {
  id: string;
  email: string | null;
  name?: string;
  avatar_url?: string;
  plan: Plan;
  analyses_used_this_month: number;
  created_at: string;
}

export interface IdeaSession {
  id: string;
  user_id: string;
  raw_idea: string;
  idea_title?: string;
  idea_category?: string;
  status: SessionStatus;
  is_public: boolean;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleStatus {
  session_id: string;
  pitch_speech: boolean;
  market_research: boolean;
  competitor_intelligence: boolean;
  success_probability: boolean;
  feature_recommendations: boolean;
  domain_suggestions: boolean;
  roast_analysis: boolean;
  validation_checklist: boolean;
  monetization_strategies: boolean;
  team_structure: boolean;
  budget_breakdown: boolean;
  ui_flow: boolean;
  ppt_slides: boolean;
}

export interface PitchSpeech {
  session_id: string;
  hook: string;
  problem: string;
  solution: string;
  how_it_works: string[];
  target_market: string;
  business_model: string;
  traction: string;
  ask: string;
  closing_line: string;
  full_speech: string;
}

export interface MarketResearch {
  session_id: string;
  industry: string;
  overview: string;
  tam: number;
  sam: number;
  som: number;
  tam_label: string;
  sam_label: string;
  som_label: string;
  cagr: number;
  demographics: Record<string, string>;
  trends: string[];
  risks: string[];
  top_regions: string[];
}

export interface Competitor {
  name: string;
  website: string;
  description: string;
  audience: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  rating?: string;
  funding?: string;
}

export interface CompetitorIntelligence {
  session_id: string;
  competitors: Competitor[];
  market_gap: string;
  differentiation_opportunities: string[];
}

export interface SuccessProbability {
  session_id: string;
  problem_clarity: number;
  market_size: number;
  competition: number;
  technical_feasibility: number;
  monetization: number;
  timing: number;
  founder_market_fit: number;
  virality: number;
  overall_score: number;
  verdict: string;
  improvement_actions: string[];
}

export interface Feature {
  name: string;
  description: string;
  estimated_days: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface FeatureRecommendations {
  session_id: string;
  mvp_features: Feature[];
  v1_features: Feature[];
  v2_features: Feature[];
  dev_workflow: {
    team: string;
    stack: string;
    methodology: string;
    tech_risks: string[];
    third_party_services: string[];
  };
}

export interface DomainName {
  name: string;
  reasoning: string;
  style: string;
}

export interface DomainSuggestions {
  session_id: string;
  names: DomainName[];
}

export interface RoastPoint {
  roast: string;
  why_it_matters: string;
  rebuttal: string;
}

export interface RoastAnalysis {
  session_id: string;
  roast_points: RoastPoint[];
  overall_verdict: string;
}

export interface ChecklistItem {
  task: string;
  success_signal: string;
  time_estimate: string;
  phase: string;
  completed?: boolean;
}

export interface ValidationChecklist {
  session_id: string;
  checklist: ChecklistItem[];
  completed_items: string[];
}

export interface MonetizationStrategy {
  model_name: string;
  application: string;
  pros: string[];
  cons: string[];
  fit_score: number;
  examples: string[];
  revenue_projection_1k_users: string;
}

export interface MonetizationStrategies {
  session_id: string;
  strategies: MonetizationStrategy[];
  recommended_model: string;
  recommendation_reasoning: string;
}

export interface TeamRole {
  title: string;
  responsibilities: string[];
  skills: string[];
  salary_india: number;
  salary_us: number;
  hire_as: string;
}

export interface TeamStructure {
  session_id: string;
  founding_roles: TeamRole[];
  early_hires: TeamRole[];
  total_monthly_salary_india: number;
  total_monthly_salary_us: number;
}

export interface BudgetItem {
  name: string;
  description: string;
  monthly_cost_usd: number;
  category: string;
  is_optional: boolean;
}

export interface BudgetBreakdown {
  session_id: string;
  setup_costs: BudgetItem[];
  monthly_costs: BudgetItem[];
  burn_rate_launch: number;
  burn_rate_1k: number;
  burn_rate_10k: number;
  currency: string;
}

export interface UIScreen {
  name: string;
  purpose: string;
  ui_elements: string[];
  connections: string[];
}

export interface UIFlow {
  session_id: string;
  screens: UIScreen[];
  mermaid_code: string;
}

export interface PPTSlide {
  session_id: string;
  slide_number: number;
  title: string;
  content: string;
  layout: string;
  speaker_notes: string;
}

export interface FullAnalysis {
  session: IdeaSession;
  module_status: ModuleStatus;
  pitch_speech?: PitchSpeech;
  market_research?: MarketResearch;
  competitor_intelligence?: CompetitorIntelligence;
  success_probability?: SuccessProbability;
  feature_recommendations?: FeatureRecommendations;
  domain_suggestions?: DomainSuggestions;
  roast_analysis?: RoastAnalysis;
  validation_checklist?: ValidationChecklist;
  monetization_strategies?: MonetizationStrategies;
  team_structure?: TeamStructure;
  budget_breakdown?: BudgetBreakdown;
  ui_flow?: UIFlow;
}
