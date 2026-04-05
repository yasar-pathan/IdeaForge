-- =============================================================================
-- Drop Clerk legacy columns (Supabase Auth only)
-- =============================================================================
-- Run this ONCE in the Supabase SQL Editor if profile creation fails with:
--   null value in column "clerk_id" of relation "users" violates not-null constraint
--
-- IdeaForge with Supabase Auth uses public.users.id = auth.users.id.
-- The clerk_id column is obsolete and should not exist on public.users.
-- =============================================================================

ALTER TABLE public.users DROP COLUMN IF EXISTS clerk_id;

-- Older schemas sometimes had Clerk references on sessions (safe no-ops if missing)
ALTER TABLE public.idea_sessions DROP COLUMN IF EXISTS clerk_id;
ALTER TABLE public.idea_sessions DROP COLUMN IF EXISTS clerk_user_id;
