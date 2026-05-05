# ⚡ IdeaForge Master Implementation Plan — Part 1
### From Launch Readiness 5/10 → 10/10

> **Companion:** [Part 2 — Sprints 4-6, Growth, and Launch Checklist](file:///C:/Users/yasar/.gemini/antigravity/brain/6aede133-adac-481e-bb3e-cdba55ac20cc/MasterPlan_Part2.md)

---

## 📊 India-First Economics & Pricing

### Cost Analysis (per full idea = 12 modules)

| Item | Cost |
|------|------|
| Gemini API (12 modules) | ₹25-30 |
| Supabase (free tier covers ~50k rows) | ₹0 for now |
| Vercel (free tier) | ₹0 for now |
| **Total cost per idea** | **~₹30** |

### Pricing Strategy (INR via Razorpay)

> [!IMPORTANT]
> **Razorpay over Stripe.** Stripe India has delayed payouts and limited UPI support. Razorpay is the standard for Indian SaaS — supports UPI, cards, wallets, net banking, and has Razorpay Subscriptions for recurring billing.

| Tier | Price | Analyses/Month | Margin per idea | Target User |
|------|-------|----------------|-----------------|-------------|
| **Free** | ₹0 | 3 ideas | -₹90 (acquisition cost) | Students, explorers |
| **Pro** | ₹499/mo | 15 ideas | ₹499 - (15×30) = ₹49 profit + retention | Serious solo founders |
| **Founder** | ₹1,499/mo | Unlimited + Teams (5 seats) | High margin at scale | Co-founding teams |

### Pay-Per-Export (One-time via Razorpay Payment Links)

| Export | Price |
|--------|-------|
| White-label PPT (no branding) | ₹149 |
| Investor One-Pager PDF | ₹99 |
| Notion/Markdown Bundle | ₹129 |

### Revenue Milestones

| Milestone | How |
|-----------|-----|
| **₹80k/mo (~$1k)** | 160 Pro users OR 53 Pro + 1 Founder team |
| **₹8L/mo (~$10k)** | 800 Pro + 100 Founder + exports |

---

## 🗄️ Database Schema Migration

> [!NOTE]
> Run this in Supabase SQL Editor. This adds all tables needed for every feature in the plan.

### New Migration: `002_master_plan.sql`

**File:** `src/lib/supabase/002_master_plan.sql`

```sql
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
-- NOTE: If any existing users have plan='team', migrate them first:
--   UPDATE public.users SET plan = 'founder' WHERE plan = 'team';
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
```

---

## 🏗️ Sprint Plan Overview (6 Sprints × 2 Weeks)

| Sprint | Weeks | Focus | Readiness After |
|--------|-------|-------|-----------------|
| **Sprint 1** | 1-2 | Razorpay + Usage Gating + Pre-Auth Capture | 6/10 |
| **Sprint 2** | 3-4 | OG Images + Hero Overhaul + Social Proof | 7/10 |
| **Sprint 3** | 5-6 | Public Gallery + Leaderboard + Roast Feed | 8/10 |
| **Sprint 4** | 7-8 | Onboarding Wizard + Iteration Tracking + Email Digest | 9/10 |
| **Sprint 5** | 9-10 | Team Workspaces + One-Pager Export + API Access | 9.5/10 |
| **Sprint 6** | 11-12 | Polish + SEO + Launch Prep | **10/10** |

---

## 🔴 Sprint 1 — Revenue Infrastructure (Weeks 1-2)
> **Goal:** Users can pay. Free limits enforced. Pre-auth idea capture works.

### Task 1.1: Install Dependencies
```bash
npm install razorpay resend @vercel/og @react-email/components
```

### Task 1.2: Razorpay Integration

**New env vars** (add to `.env.example` and `.env.local`):
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_RAZORPAY_PLAN_PRO=plan_xxxxx
NEXT_PUBLIC_RAZORPAY_PLAN_FOUNDER=plan_xxxxx
```

**New files to create:**

| File | Purpose |
|------|---------|
| `src/lib/razorpay.ts` | Server-side Razorpay client init |
| `src/app/api/billing/create-subscription/route.ts` | Create Razorpay subscription for Pro/Founder |
| `src/app/api/billing/verify/route.ts` | Verify payment signature |
| `src/app/api/webhooks/razorpay/route.ts` | Handle `subscription.activated`, `subscription.charged`, `subscription.cancelled` events |
| `src/app/api/billing/portal/route.ts` | Generate Razorpay customer portal link |
| `src/hooks/useBilling.ts` | Client hook for plan status + upgrade flows |
| `src/components/ui/UpgradeModal.tsx` | In-app upgrade prompt with Razorpay Checkout |
| `src/components/ui/UsageBar.tsx` | "1/3 free ideas used this month" indicator |

**Implementation details for `src/lib/razorpay.ts`:**
```typescript
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  pro:     { id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_PRO!, price: 49900, name: 'Pro', limit: 15 },
  founder: { id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_FOUNDER!, price: 149900, name: 'Founder', limit: 999 },
} as const;
```

**Key webhook logic (`/api/webhooks/razorpay/route.ts`):**
- Verify webhook signature with `razorpay_key_secret`
- On `subscription.activated` → update `users.plan`, `subscription_status`, `razorpay_subscription_id`
- On `subscription.charged` → reset `analyses_used_this_month = 0`, update `plan_expires_at`
- On `subscription.cancelled` → set `plan = 'free'`, `subscription_status = 'cancelled'`

### Task 1.3: Usage Gating UI

**Modify:** `src/app/api/analyze/route.ts`
- Keep `monthlyAnalysisCap('free')` at 3 (no change to default)
- Return `remaining_analyses` count in the 429 response
- Return `{ remaining: limit - used }` in success response

**New component:** `src/components/ui/UsageBar.tsx`
- Shows in dashboard header: `"1/3 free ideas used"` with progress bar
- Turns amber at 2/3, red at 3/3
- Clicking it when at limit opens `UpgradeModal`

**New component:** `src/components/ui/UpgradeModal.tsx`
- Triggered when user hits limit OR clicks upgrade CTA
- Shows Pro (₹499/mo) and Founder (₹1,499/mo) side by side
- Loads Razorpay Checkout script dynamically
- On success → calls `/api/billing/verify` → refreshes user state

**Modify:** `src/components/landing/Pricing.tsx`
- Replace `"Upgrade (soon)"` → actual Razorpay checkout trigger
- Replace `"Contact (soon)"` → actual Razorpay checkout trigger
- Update prices: Free ₹0, Pro ₹499/mo, Founder ₹1,499/mo
- Add `"Save 20% annually"` toggle for yearly pricing

### Task 1.4: Pre-Auth Idea Capture

**Modify:** `src/components/landing/IdeaForgeModal.tsx`
- Remove auth check from modal — let anyone type
- On submit: check if user is logged in
  - **Logged in:** call `/api/analyze` as normal
  - **Not logged in:** save idea to `localStorage.setItem('ideaforge_pending_idea', idea)`, then `router.push('/sign-up?next=forge')`

**Modify:** `src/app/page.tsx` (or LandingPage mount)
- On mount, check `localStorage.getItem('ideaforge_pending_idea')`
- If present AND user is now authenticated → auto-submit to `/api/analyze`, clear localStorage

**New:** `src/hooks/usePendingIdea.ts`
```typescript
export function usePendingIdea() {
  const save = (idea: string) => localStorage.setItem('ideaforge_pending_idea', idea);
  const get = () => localStorage.getItem('ideaforge_pending_idea');
  const clear = () => localStorage.removeItem('ideaforge_pending_idea');
  return { save, get, clear };
}
```

### Task 1.5: Fix Pricing Component
**Modify:** `src/components/landing/Pricing.tsx`

Updated tier data:
```typescript
const tiers = [
  {
    name: 'Free',
    price: '₹0',
    desc: 'Try the full pipeline',
    features: ['3 analyses / month', 'All 12 modules', 'PPT download (branded)', 'Dashboard history'],
    cta: 'Start free',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/mo',
    desc: 'For serious builders',
    features: ['15 analyses / month', 'Priority Gemini Pro', 'White-label exports', 'Iteration tracking'],
    cta: 'Upgrade to Pro',
    action: 'checkout_pro',
    highlight: true,
  },
  {
    name: 'Founder',
    price: '₹1,499',
    period: '/mo',
    desc: 'For co-founding teams',
    features: ['Unlimited analyses', 'Team workspace (5 seats)', 'Investor one-pager', 'Everything in Pro'],
    cta: 'Start Founder plan',
    action: 'checkout_founder',
    highlight: false,
  },
];
```

**Wire up `action` fields:** In the component's JSX, replace the `<Link>` wrapper with an `onClick` handler:
```typescript
// For tiers with action: use onClick to trigger UpgradeModal/Razorpay checkout
// For tiers without action (Free): keep the <Link href="/sign-up"> as-is
const handleTierClick = (action?: string) => {
  if (action === 'checkout_pro') openUpgradeModal('pro');
  if (action === 'checkout_founder') openUpgradeModal('founder');
};
```

---

## 🟡 Sprint 2 — Trust & Virality (Weeks 3-4)
> **Goal:** Share links look gorgeous. Hero shows real output. Social proof counters.

### Task 2.0: Build Real Share Page (Prerequisite)

> [!IMPORTANT]
> The current `src/app/share/[token]/page.tsx` is a **stub** that does not load any data. OG images (Task 2.1) depend on this page actually fetching session data. Build it first.

**Modify:** `src/app/share/[token]/page.tsx`
- Fetch the session by `share_token` using Supabase service role
- Render a read-only, public results view (subset of `ResultsDashboard`) showing:
  - Idea title, category, success score
  - Pitch speech summary
  - Market data (TAM/SAM/SOM)
  - "Analyze YOUR idea" CTA → `/` (drives signups)
- If token not found → render a 404-style page

### Task 2.1: OG Image Generation

**New file:** `src/app/api/og/route.tsx`
- Uses `@vercel/og` (ImageResponse)
- Accepts `?title=...&score=...&category=...` query params
- Renders a 1200×630 card with:
  - IdeaForge logo top-left
  - Idea title (large, white on dark gradient)
  - Score badge (circular, color-coded: green >70, amber >40, red <40)
  - Category pill
  - "Analyze your idea at ideaforge.app" footer

**Modify:** `src/app/share/[token]/page.tsx`
- Add `generateMetadata()` that fetches session by `share_token`
- Returns proper `<meta>` tags:
```typescript
export async function generateMetadata({ params }) {
  const session = await getSessionByToken(params.token);
  const score = session?.success_probability?.overall_score ?? '';
  return {
    title: `${session.idea_title} — IdeaForge Analysis`,
    description: `AI-generated startup analysis. Success score: ${score}/100`,
    openGraph: {
      title: session.idea_title,
      description: `Success Score: ${score}/100 — Full analysis on IdeaForge`,
      images: [`/api/og?title=${encodeURIComponent(session.idea_title)}&score=${score}&category=${session.idea_category}`],
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

### Task 2.2: Hero Section Overhaul

**Modify:** `src/components/landing/Hero.tsx`
- Replace the skeleton dashboard mock (lines 163-228) with a **real screenshot carousel**
- Take 3 actual screenshots of: (1) Success Score card, (2) Pitch Speech card, (3) Competitor Analysis card
- Use `framer-motion` `AnimatePresence` to auto-rotate them every 4 seconds
- Add a subtle "Live analysis preview" label (not "LIVE DASHBOARD PREVIEW" on a skeleton)

**Add social proof bar after the CTA buttons (line ~158):**
```tsx
<motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-8 text-sm text-white/50">
  <span><strong className="text-white">{stats.totalUsers}+</strong> founders</span>
  <span className="w-px h-4 bg-white/20" />
  <span><strong className="text-white">{stats.totalAnalyses}+</strong> ideas analyzed</span>
  <span className="w-px h-4 bg-white/20" />
  <span>Avg score: <strong className="text-white">{stats.avgScore}</strong></span>
</motion.div>
```

**New API:** `src/app/api/stats/route.ts`
- Queries `platform_stats` table (or computes from `idea_sessions` count)
- Returns `{ totalUsers, totalAnalyses, avgScore }`
- Cache with `revalidate: 3600` (1 hour)

### Task 2.3: Social Proof System

**New file:** `src/lib/updatePlatformStats.ts`
- Called after each successful analysis creation
- Increments `total_analyses` in `platform_stats`
- Recalculates `avg_success_score` periodically

**Modify:** `src/app/api/analyze/route.ts`
- After successful session creation, call `updatePlatformStats()`

### Task 2.4: Share Button on Results Page

**Modify:** `src/components/results/DownloadBar.tsx`
- Add a "Share" button next to Download PPT/PDF
- On click: copies the `/share/{share_token}` URL to clipboard
- Also adds a "Make Public" toggle that sets `is_public = true` via PATCH

---

## 🟢 Sprint 3 — Discovery Engine (Weeks 5-6)
> **Goal:** Public gallery drives SEO. Leaderboard drives competition. Roast feed drives virality.

### Task 3.1: Public Idea Gallery (`/explore`)

**New files:**
| File | Purpose |
|------|---------|
| `src/app/explore/page.tsx` | Server component with metadata for SEO |
| `src/components/explore/ExploreGrid.tsx` | Client component with filters |
| `src/app/api/explore/route.ts` | Public API: paginated, filterable public sessions |

**API (`/api/explore`):**
```typescript
// Query params: ?category=&sort=score|recent&page=1&limit=12
// Returns: public sessions with score, title, category, created_at
// No auth required
const { data } = await supabaseAdmin
  .from('idea_sessions')
  .select('id, idea_title, idea_category, share_token, created_at, success_probability(overall_score)')
  .eq('is_public', true)
  .order(sort === 'score' ? 'success_probability.overall_score' : 'created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

**UI:** Grid of glassmorphic cards showing:
- Idea title (links to `/share/{token}`)
- Score badge (color-coded circle)
- Category pill
- Time ago
- Filter bar: category dropdown + sort toggle (Top Scored / Recent)

**SEO:** Each card links to `/share/[token]` which has full OG meta → Google indexes these.

### Task 3.2: Leaderboard (`/leaderboard`)

**New files:**
| File | Purpose |
|------|---------|
| `src/app/leaderboard/page.tsx` | Weekly/monthly/all-time leaderboard |
| `src/app/api/leaderboard/route.ts` | Top 50 public sessions by score |

**UI:** Ranked list with:
- Position (#1, #2, #3 with gold/silver/bronze styling)
- Idea title + category
- Score (large, prominent)
- "View Analysis" CTA → `/share/{token}`
- Tabs: This Week / This Month / All Time

### Task 3.3: Public Roast Feed (`/roast`)

**New files:**
| File | Purpose |
|------|---------|
| `src/app/roast/page.tsx` | Public roast feed |
| `src/components/roast/RoastFeedCard.tsx` | Individual roast card with vote buttons |
| `src/app/api/roast/route.ts` | GET: public roasts. POST: vote on a roast |

**UI for each roast card:**
- Idea title + category badge
- Top 3 roast points (from `roast_analysis.roast_points` JSONB)
- Vote buttons: 🔥 Brutal / ⚖️ Fair / 🧸 Soft
- Total votes count
- "Share this roast" → copies a direct link
- "Get YOUR idea roasted" CTA → `/` (drives signups)

**Vote endpoint (`POST /api/roast`):**
```typescript
// Body: { session_id, vote_type: 'brutal'|'fair'|'soft' }
// Upsert into roast_votes (one vote per user per session)
// Return updated vote counts
```

### Task 3.4: Navigation Updates

**Modify:** `src/components/layout/Navbar.tsx` (or equivalent)
- Add nav links: Explore, Leaderboard, Roast Feed
- These are public pages (add to `isPublicPath()` in `middleware.ts`)

**Modify:** `src/middleware.ts`
- Add to public paths:
```typescript
if (pathname.startsWith('/explore')) return true;
if (pathname.startsWith('/leaderboard')) return true;
if (pathname.startsWith('/roast')) return true;
```

---

> **Continue to [Part 2 →](file:///C:/Users/yasar/.gemini/antigravity/brain/6aede133-adac-481e-bb3e-cdba55ac20cc/MasterPlan_Part2.md)** for Sprints 4-6, growth strategy, and the launch checklist.
