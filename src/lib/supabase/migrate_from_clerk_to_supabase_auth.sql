-- =============================================================================
-- IdeaForge: migrate from Clerk-era schema → Supabase Auth schema
-- =============================================================================
-- Run this ONCE in Supabase SQL Editor after you already applied the old
-- schema (clerk_id on idea_sessions, public.users with clerk_id, etc.).
--
-- ⚠️  This DROPS all IdeaForge public tables listed below. All analyses /
--     sessions tied to the old Clerk IDs are removed. Auth users in
--     auth.users are kept; we backfill public.users for them at the end.
--
-- Safe order: 1) run this file  2) users sign in with Supabase Auth only
-- =============================================================================

-- Stop trigger touching public.users while we rebuild it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop old policies + tables (CASCADE removes FKs; order: children → sessions → users)
DROP TABLE IF EXISTS
  public.module_status,
  public.ppt_slides,
  public.ui_flow,
  public.budget_breakdown,
  public.team_structure,
  public.monetization_strategies,
  public.validation_checklist,
  public.roast_analysis,
  public.domain_suggestions,
  public.feature_recommendations,
  public.success_probability,
  public.competitor_intelligence,
  public.market_research,
  public.pitch_speech,
  public.idea_sessions,
  public.users
CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS: id must match auth.users.id
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  analyses_used_this_month INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.idea_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  raw_idea TEXT NOT NULL,
  idea_title TEXT,
  idea_category TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'complete', 'failed')),
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pitch_speech (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  hook TEXT,
  problem TEXT,
  solution TEXT,
  how_it_works JSONB DEFAULT '[]',
  target_market TEXT,
  business_model TEXT,
  traction TEXT,
  ask TEXT,
  closing_line TEXT,
  full_speech TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.market_research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  industry TEXT,
  overview TEXT,
  tam BIGINT,
  sam BIGINT,
  som BIGINT,
  tam_label TEXT,
  sam_label TEXT,
  som_label TEXT,
  cagr FLOAT,
  demographics JSONB DEFAULT '{}',
  trends JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  top_regions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.competitor_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  competitors JSONB DEFAULT '[]',
  market_gap TEXT,
  differentiation_opportunities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.success_probability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  problem_clarity INTEGER,
  market_size INTEGER,
  competition INTEGER,
  technical_feasibility INTEGER,
  monetization INTEGER,
  timing INTEGER,
  founder_market_fit INTEGER,
  virality INTEGER,
  overall_score INTEGER,
  verdict TEXT,
  improvement_actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.feature_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  mvp_features JSONB DEFAULT '[]',
  v1_features JSONB DEFAULT '[]',
  v2_features JSONB DEFAULT '[]',
  dev_workflow JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.domain_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  names JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.roast_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  roast_points JSONB DEFAULT '[]',
  overall_verdict TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.validation_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  checklist JSONB DEFAULT '[]',
  completed_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.monetization_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  strategies JSONB DEFAULT '[]',
  recommended_model TEXT,
  recommendation_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.team_structure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  founding_roles JSONB DEFAULT '[]',
  early_hires JSONB DEFAULT '[]',
  total_monthly_salary_india INTEGER,
  total_monthly_salary_us INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.budget_breakdown (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  setup_costs JSONB DEFAULT '[]',
  monthly_costs JSONB DEFAULT '[]',
  burn_rate_launch INTEGER,
  burn_rate_1k INTEGER,
  burn_rate_10k INTEGER,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ui_flow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  screens JSONB DEFAULT '[]',
  mermaid_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ppt_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  layout TEXT DEFAULT 'default',
  speaker_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.module_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions (id) ON DELETE CASCADE UNIQUE,
  pitch_speech BOOLEAN DEFAULT FALSE,
  market_research BOOLEAN DEFAULT FALSE,
  competitor_intelligence BOOLEAN DEFAULT FALSE,
  success_probability BOOLEAN DEFAULT FALSE,
  feature_recommendations BOOLEAN DEFAULT FALSE,
  domain_suggestions BOOLEAN DEFAULT FALSE,
  roast_analysis BOOLEAN DEFAULT FALSE,
  validation_checklist BOOLEAN DEFAULT FALSE,
  monetization_strategies BOOLEAN DEFAULT FALSE,
  team_structure BOOLEAN DEFAULT FALSE,
  budget_breakdown BOOLEAN DEFAULT FALSE,
  ui_flow BOOLEAN DEFAULT FALSE,
  ppt_slides BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Rows for people who already exist in auth.users (before trigger was active)
INSERT INTO public.users (id, email, name, avatar_url)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(COALESCE(au.email, 'user'), '@', 1)
  ),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users AS au
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_speech ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_probability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roast_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetization_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppt_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_status ENABLE ROW LEVEL SECURITY;

-- Idempotent: safe if you re-run after a partial migration
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
DROP POLICY IF EXISTS "Service role full access sessions" ON public.idea_sessions;
DROP POLICY IF EXISTS "Service role full access pitch" ON public.pitch_speech;
DROP POLICY IF EXISTS "Service role full access market" ON public.market_research;
DROP POLICY IF EXISTS "Service role full access competitor" ON public.competitor_intelligence;
DROP POLICY IF EXISTS "Service role full access success" ON public.success_probability;
DROP POLICY IF EXISTS "Service role full access features" ON public.feature_recommendations;
DROP POLICY IF EXISTS "Service role full access domain" ON public.domain_suggestions;
DROP POLICY IF EXISTS "Service role full access roast" ON public.roast_analysis;
DROP POLICY IF EXISTS "Service role full access checklist" ON public.validation_checklist;
DROP POLICY IF EXISTS "Service role full access monetization" ON public.monetization_strategies;
DROP POLICY IF EXISTS "Service role full access team" ON public.team_structure;
DROP POLICY IF EXISTS "Service role full access budget" ON public.budget_breakdown;
DROP POLICY IF EXISTS "Service role full access uiflow" ON public.ui_flow;
DROP POLICY IF EXISTS "Service role full access ppt" ON public.ppt_slides;
DROP POLICY IF EXISTS "Service role full access modulestatus" ON public.module_status;

CREATE POLICY "Service role full access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Service role full access sessions" ON public.idea_sessions FOR ALL USING (true);
CREATE POLICY "Service role full access pitch" ON public.pitch_speech FOR ALL USING (true);
CREATE POLICY "Service role full access market" ON public.market_research FOR ALL USING (true);
CREATE POLICY "Service role full access competitor" ON public.competitor_intelligence FOR ALL USING (true);
CREATE POLICY "Service role full access success" ON public.success_probability FOR ALL USING (true);
CREATE POLICY "Service role full access features" ON public.feature_recommendations FOR ALL USING (true);
CREATE POLICY "Service role full access domain" ON public.domain_suggestions FOR ALL USING (true);
CREATE POLICY "Service role full access roast" ON public.roast_analysis FOR ALL USING (true);
CREATE POLICY "Service role full access checklist" ON public.validation_checklist FOR ALL USING (true);
CREATE POLICY "Service role full access monetization" ON public.monetization_strategies FOR ALL USING (true);
CREATE POLICY "Service role full access team" ON public.team_structure FOR ALL USING (true);
CREATE POLICY "Service role full access budget" ON public.budget_breakdown FOR ALL USING (true);
CREATE POLICY "Service role full access uiflow" ON public.ui_flow FOR ALL USING (true);
CREATE POLICY "Service role full access ppt" ON public.ppt_slides FOR ALL USING (true);
CREATE POLICY "Service role full access modulestatus" ON public.module_status FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_idea_sessions_user_id ON public.idea_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_idea_sessions_status ON public.idea_sessions (status);
CREATE INDEX IF NOT EXISTS idx_ppt_slides_session_id ON public.ppt_slides (session_id);
CREATE INDEX IF NOT EXISTS idx_module_status_session_id ON public.module_status (session_id);
