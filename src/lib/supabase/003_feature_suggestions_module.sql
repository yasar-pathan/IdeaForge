-- Add separate feature_suggestions module.
-- Run this in Supabase SQL Editor for existing projects.

CREATE TABLE IF NOT EXISTS public.feature_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.idea_sessions(id) ON DELETE CASCADE UNIQUE,
  must_have_features JSONB DEFAULT '[]',
  differentiator_features JSONB DEFAULT '[]',
  retention_features JSONB DEFAULT '[]',
  monetization_features JSONB DEFAULT '[]',
  recommended_next_3 JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feature_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access feature suggestions" ON public.feature_suggestions;
CREATE POLICY "Service role full access feature suggestions" ON public.feature_suggestions FOR ALL USING (true);

ALTER TABLE public.module_status
  ADD COLUMN IF NOT EXISTS feature_suggestions BOOLEAN DEFAULT FALSE;
