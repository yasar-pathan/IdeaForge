-- =============================================
-- IDEAFORGE MASTER PLAN MIGRATION
-- =============================================

-- 1. USER PLANS & BILLING (Razorpay)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive','active','past_due','cancelled')),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_digest_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update plan check: replace 'team' with 'founder'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE public.users ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'pro', 'founder'));

-- 2. IDEA ITERATIONS (Version tracking)
ALTER TABLE public.idea_sessions
  ADD COLUMN IF NOT EXISTS parent_session_id UUID REFERENCES public.idea_sessions(id),
  ADD COLUMN IF NOT EXISTS iteration_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'thinking'
    CHECK (stage IN ('thinking','side_project','pre_revenue','raising')),
  ADD COLUMN IF NOT EXISTS primary_concern TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_parent ON public.idea_sessions(parent_session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_public ON public.idea_sessions(is_public) WHERE is_public = TRUE;

-- 3. PUBLIC ROAST VOTES
CREATE TABLE IF NOT EXISTS public.roast_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.idea_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('brutal','fair','soft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);
ALTER TABLE public.roast_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access roast_votes" ON public.roast_votes FOR ALL USING (true);

-- 4. TEAM WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'My Workspace',
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  invited_email TEXT,
  invite_status TEXT DEFAULT 'accepted' CHECK (invite_status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access workspaces" ON public.workspaces FOR ALL USING (true);
CREATE POLICY "Service role full access workspace_members" ON public.workspace_members FOR ALL USING (true);

-- 5. PAYMENT TRANSACTIONS LOG
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_subscription_id TEXT,
  amount_paise INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created' CHECK (status IN ('created','authorized','captured','failed','refunded')),
  type TEXT NOT NULL CHECK (type IN ('subscription','export','api_access')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access payments" ON public.payment_transactions FOR ALL USING (true);

-- 6. PLATFORM STATS (for social proof counters)
CREATE TABLE IF NOT EXISTS public.platform_stats (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_analyses INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  avg_success_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.platform_stats (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 7. Checklist persistence (completed_items already exists, add updated_at)
ALTER TABLE public.validation_checklist
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 8. API KEYS (for B2B API access — Sprint 5)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,  -- "sk_live_abc..." (first 12 chars for display)
  name TEXT DEFAULT 'Default',
  usage_this_month INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access api_keys" ON public.api_keys FOR ALL USING (true);
