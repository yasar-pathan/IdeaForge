-- ========================================================
-- Add localization columns to public.users & public.idea_sessions
-- ========================================================

-- 1. Update users table with country, currency, and onboarding
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. Update idea_sessions table with inherited values
ALTER TABLE public.idea_sessions 
  ADD COLUMN IF NOT EXISTS target_region TEXT DEFAULT 'United States',
  ADD COLUMN IF NOT EXISTS target_currency TEXT DEFAULT 'USD';
