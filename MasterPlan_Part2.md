# ⚡ IdeaForge Master Implementation Plan — Part 2
### Sprints 4-6, File Manifest, Launch Checklist

> **Companion:** [Part 1 — Economics, Schema, Sprints 1-3](file:///C:/Users/yasar/.gemini/antigravity/brain/6aede133-adac-481e-bb3e-cdba55ac20cc/MasterPlan_Part1.md)

---

## 🔵 Sprint 4 — Retention Engine (Weeks 7-8)
> **Goal:** Users have reasons to return daily. Onboarding drives activation.

### Task 4.1: Guided Onboarding Wizard

**New files:**
| File | Purpose |
|------|---------|
| `src/components/analyze/OnboardingWizard.tsx` | 3-step wizard replacing the raw textarea modal |
| `src/components/analyze/StageSelector.tsx` | "What stage?" selector (thinking/side_project/pre_revenue/raising) |
| `src/components/analyze/ConcernSelector.tsx` | "Biggest concern?" selector (market/competition/monetization/tech) |

**Flow (replaces current `IdeaForgeModal`):**

> [!NOTE]
> `IdeaForgeModal.tsx` will be **deprecated** in Sprint 4. The `OnboardingWizard` takes over its role in `LandingPage.tsx`. `IdeaForgeModal.tsx` should be deleted after migration.

| Step | UI | Data Stored |
|------|-----|-------------|
| **1. Describe** | Textarea (existing) | `raw_idea` |
| **2. Stage** | 4 pill buttons with icons | `idea_sessions.stage` |
| **3. Concern** | 4 pill buttons | `idea_sessions.primary_concern` |

- After Step 3 → submit to `/api/analyze` with `{ idea, stage, concern }`
- Backend auto-suggests which modules to generate first based on concern
- Sets `users.onboarding_completed = true` after first completed analysis

**Modify:** `src/app/api/analyze/route.ts`
- Accept `stage` and `primary_concern` in request body
- Store them in the `idea_sessions` insert

### Task 4.2: Idea Iteration Tracking

**New files:**
| File | Purpose |
|------|---------|
| `src/components/results/IterationBanner.tsx` | "This is v2 of your idea — Score improved 61→74" |
| `src/components/results/IterationDiff.tsx` | Side-by-side score comparison |
| `src/app/api/sessions/[id]/iterate/route.ts` | POST: create a new session linked to parent |

**"Re-analyze" button on Results page:**
- Appears in `DownloadBar.tsx` or results header
- Opens a modal pre-filled with the original `raw_idea` text
- User edits the idea, submits
- Backend creates a new `idea_session` with `parent_session_id` set + `iteration_number = parent + 1`

**Iteration diff view (`IterationDiff.tsx`):**
- Shows previous vs current scores across 8 dimensions (radar chart using Recharts)
- Celebration animation (existing `react-confetti`) if score improved
- Link back to previous iteration

**Modify:** `src/components/results/ResultsDashboard.tsx`
- If `session.parent_session_id` exists, show `IterationBanner` at top
- Add "Re-analyze (Iterate)" button in header

### Task 4.3: Weekly Email Digest (Resend)

**New files:**
| File | Purpose |
|------|---------|
| `src/lib/resend.ts` | Resend client init |
| `src/lib/emails/WeeklyDigest.tsx` | React email template |
| `src/app/api/cron/weekly-digest/route.ts` | Vercel Cron endpoint (runs every Monday 9am IST) |

**`vercel.json` cron config:**
```json
{
  "crons": [{
    "path": "/api/cron/weekly-digest",
    "schedule": "0 3 * * 1"
  }]
}
```

**Email content:**
- "You have X ideas in progress"
- Top 3 uncompleted checklist items across all sessions
- "Your highest-scoring idea this week: [Title] (Score: X)"
- CTA button: "Continue building →" (links to dashboard)
- Unsubscribe link (sets `email_digest_enabled = false`)

**Modify:** `src/app/dashboard/page.tsx`
- Add email preferences toggle in settings dropdown

---

## 🟣 Sprint 5 — Collaboration & Premium (Weeks 9-10)
> **Goal:** Team workspaces ship. Premium exports drive micro-transactions.

### Task 5.1: Team Workspaces MVP

**New files:**
| File | Purpose |
|------|---------|
| `src/app/team/page.tsx` | Team management page |
| `src/app/api/team/route.ts` | CRUD for workspaces |
| `src/app/api/team/invite/route.ts` | Send invite, accept/decline |
| `src/components/team/MemberList.tsx` | List workspace members |
| `src/components/team/InviteModal.tsx` | Invite by email |
| `src/lib/emails/TeamInvite.tsx` | Invite email template |

**Workspace flow:**
1. Founder-plan user creates workspace → row in `workspaces` table
2. Owner invites by email → `workspace_members` row with `invite_status='pending'`
3. Invited user signs up/logs in → auto-matched by email → status becomes `accepted`
4. Shared sessions: workspace members can view all sessions created by any workspace member

**RLS change:**
- Sessions query on dashboard: include sessions where `user_id` is any member of the user's workspace
- This is handled in the API layer (not RLS) since we use service role

**Gating:** Only `founder` plan users can create workspaces. Free/Pro see "Upgrade to Founder" CTA.

### Task 5.2: Investor One-Pager Export

**New files:**
| File | Purpose |
|------|---------|
| `src/app/api/sessions/[id]/one-pager/route.ts` | Generate one-pager HTML/image |
| `src/components/results/OnePagerPreview.tsx` | Preview modal |

**One-pager layout (single page, A4):**
```
┌──────────────────────────────────────┐
│ [Logo]  IDEA TITLE          Score:83 │
│ Category: EdTech                     │
├──────────────────────────────────────┤
│ PITCH (3 lines from pitch_speech)    │
├──────────────────────────────────────┤
│ MARKET        │ COMPETITORS          │
│ TAM: $2.3B    │ 1. Competitor A      │
│ SAM: $450M    │ 2. Competitor B      │
│ SOM: $45M     │ 3. Competitor C      │
├──────────────────────────────────────┤
│ MONETIZATION: Freemium SaaS         │
│ MVP FEATURES: Feature1, Feature2... │
├──────────────────────────────────────┤
│ "Powered by IdeaForge" (free)       │
│ or clean (paid ₹99)                 │
└──────────────────────────────────────┘
```

**Payment gating:**
- Free users: one-pager has "Powered by IdeaForge" watermark
- ₹99 one-time payment (Razorpay Payment Link) → removes branding
- Pro/Founder: always clean

### Task 5.3: API Access (B2B)

**New files:**
| File | Purpose |
|------|---------|
| `src/app/api/v1/analyze/route.ts` | Public API endpoint (API key auth) |
| `src/app/api/api-keys/route.ts` | Generate/revoke API keys |
| `src/app/settings/api/page.tsx` | API key management UI |
| `src/lib/apiKeyAuth.ts` | Middleware to validate API keys |

**API key table:**

> [!NOTE]
> The `api_keys` table is already included in `002_master_plan.sql` (Part 1 migration, section 8). No additional SQL migration needed here.

**Pricing:** ₹3,999/mo (Starter, 100 sessions) | ₹14,999/mo (Studio, 1000 sessions)

---

## ⚪ Sprint 6 — Polish & Launch (Weeks 11-12)
> **Goal:** SEO optimized. Performance tuned. Ready for Product Hunt.

### Task 6.1: SEO Optimization

**Modify:** `src/app/layout.tsx`
```typescript
export const metadata = {
  title: 'IdeaForge — AI Startup Idea Analyzer',
  description: 'Turn your raw idea into an investor-ready package in 2 minutes. Pitch speech, market research, competitor analysis, success score, and more.',
  keywords: ['startup idea validator', 'AI business plan', 'pitch deck generator', 'TAM SAM SOM calculator'],
  openGraph: {
    title: 'IdeaForge — AI Startup Idea Analyzer',
    description: 'Turn your raw idea into an investor-ready package in 2 minutes.',
    url: 'https://ideaforge.app',
    siteName: 'IdeaForge',
    images: ['/api/og?title=IdeaForge&score=&category='],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};
```

**New files:**
| File | Purpose |
|------|---------|
| `src/app/sitemap.ts` | Dynamic sitemap (all public sessions + static pages) |
| `src/app/robots.ts` | robots.txt allowing all crawlers |
| `src/app/blog/page.tsx` | Blog index (MDX or simple) |
| `src/app/blog/[slug]/page.tsx` | Individual blog posts for SEO |

**3 launch blog posts (content):**
1. "How to Validate a Startup Idea in 2026 (Step-by-Step)"
2. "TAM SAM SOM Calculator: How to Size Your Market"
3. "AI vs. Manual: Building a Pitch Deck in 2 Minutes"

### Task 6.2: Performance & Polish

- Add `loading.tsx` skeletons for `/dashboard`, `/explore`, `/results/[id]`
- Add error boundaries with `error.tsx` for all routes
- Lazy-load heavy components: Mermaid, Recharts, pptxgenjs
- Add `Suspense` boundaries around dynamic imports
- Test mobile responsiveness on all new pages
- Add `aria-label` and `role` attributes for accessibility

### Task 6.3: "Powered by IdeaForge" Watermark on Free Exports

**Modify:** `src/lib/exportResultsPdf.ts`
- Add watermark footer: "Generated by IdeaForge — ideaforge.app"
- Check user plan — skip watermark for Pro/Founder

**Modify:** PPT download handler
- Add first/last slide: "Built with IdeaForge" (free tier only)

### Task 6.4: Product Hunt Launch Prep

**Checklist:**
- [ ] Create Product Hunt maker profile
- [ ] Prepare tagline: "Turn any idea into an investor-ready package in 2 minutes"
- [ ] Record 60-second demo video (Loom)
- [ ] Take 5 gallery screenshots: Landing, Workspace, Results, Explore, Roast Feed
- [ ] Write first comment (the maker comment explaining your story)
- [ ] Schedule for Tuesday 12:01 AM PST
- [ ] Reach out to 3 hunters with >1000 followers

---

## 📁 Complete File Manifest

### New Files (36 files)

> [!NOTE]
> `vercel.json` (item 45) is a **new file**, not a modification of an existing one.

| # | File Path | Sprint |
|---|-----------|--------|
| 1 | `src/lib/supabase/002_master_plan.sql` | 1 |
| 2 | `src/lib/razorpay.ts` | 1 |
| 3 | `src/app/api/billing/create-subscription/route.ts` | 1 |
| 4 | `src/app/api/billing/verify/route.ts` | 1 |
| 5 | `src/app/api/webhooks/razorpay/route.ts` | 1 |
| 6 | `src/app/api/billing/portal/route.ts` | 1 |
| 7 | `src/hooks/useBilling.ts` | 1 |
| 8 | `src/hooks/usePendingIdea.ts` | 1 |
| 9 | `src/components/ui/UpgradeModal.tsx` | 1 |
| 10 | `src/components/ui/UsageBar.tsx` | 1 |
| 11 | `src/app/api/og/route.tsx` | 2 |
| 12 | `src/app/api/stats/route.ts` | 2 |
| 13 | `src/lib/updatePlatformStats.ts` | 2 |
| 14 | `src/app/explore/page.tsx` | 3 |
| 15 | `src/components/explore/ExploreGrid.tsx` | 3 |
| 16 | `src/app/api/explore/route.ts` | 3 |
| 17 | `src/app/leaderboard/page.tsx` | 3 |
| 18 | `src/app/api/leaderboard/route.ts` | 3 |
| 19 | `src/app/roast/page.tsx` | 3 |
| 20 | `src/components/roast/RoastFeedCard.tsx` | 3 |
| 21 | `src/app/api/roast/route.ts` | 3 |
| 22 | `src/components/analyze/OnboardingWizard.tsx` | 4 |
| 23 | `src/components/analyze/StageSelector.tsx` | 4 |
| 24 | `src/components/analyze/ConcernSelector.tsx` | 4 |
| 25 | `src/components/results/IterationBanner.tsx` | 4 |
| 26 | `src/components/results/IterationDiff.tsx` | 4 |
| 27 | `src/app/api/sessions/[id]/iterate/route.ts` | 4 |
| 28 | `src/lib/resend.ts` | 4 |
| 29 | `src/lib/emails/WeeklyDigest.tsx` | 4 |
| 30 | `src/app/api/cron/weekly-digest/route.ts` | 4 |
| 31 | `src/app/team/page.tsx` | 5 |
| 32 | `src/app/api/team/route.ts` | 5 |
| 33 | `src/app/api/team/invite/route.ts` | 5 |
| 34 | `src/components/team/MemberList.tsx` | 5 |
| 35 | `src/components/team/InviteModal.tsx` | 5 |
| 36 | `src/lib/emails/TeamInvite.tsx` | 5 |
| 37 | `src/app/api/sessions/[id]/one-pager/route.ts` | 5 |
| 38 | `src/components/results/OnePagerPreview.tsx` | 5 |
| 39 | `src/app/api/v1/analyze/route.ts` | 5 |
| 40 | `src/app/api/api-keys/route.ts` | 5 |
| 41 | `src/app/settings/api/page.tsx` | 5 |
| 42 | `src/lib/apiKeyAuth.ts` | 5 |
| 43 | `src/app/sitemap.ts` | 6 |
| 44 | `src/app/robots.ts` | 6 |
| 45 | `vercel.json` | 4 |

### Modified Files (14 files)

| # | File Path | Sprint | What Changes |
|---|-----------|--------|-------------|
| 1 | `src/components/landing/Pricing.tsx` | 1 | INR prices, real CTAs, Razorpay checkout |
| 2 | `src/components/landing/IdeaForgeModal.tsx` | 1→4 | Pre-auth capture in Sprint 1 → **delete** in Sprint 4 (replaced by OnboardingWizard) |
| 3 | `src/app/api/analyze/route.ts` | 1,4 | Usage response, stage/concern fields |
| 4 | `src/hooks/useAnalysis.ts` | 1 | Handle pending idea from localStorage |
| 5 | `src/components/landing/Hero.tsx` | 2 | Real screenshots, social proof bar |
| 6 | `src/app/share/[token]/page.tsx` | 2 | Build real share page (currently a stub) + OG meta tags via generateMetadata |
| 7 | `src/components/results/DownloadBar.tsx` | 2,4 | Share button, Re-analyze button |
| 8 | `src/middleware.ts` | 3 | Add /explore, /leaderboard, /roast to public paths |
| 9 | `src/components/results/ResultsDashboard.tsx` | 4 | Iteration banner, re-analyze button |
| 10 | `src/app/dashboard/page.tsx` | 1,4 | UsageBar component, email prefs |
| 11 | `src/lib/exportResultsPdf.ts` | 6 | Watermark for free tier |
| 12 | `src/app/layout.tsx` | 6 | Full SEO metadata |
| 13 | `.env.example` | 1 | Razorpay + Resend env vars |
| 14 | `package.json` | 1 | New dependencies |

---

## ✅ Launch Readiness Checklist (5/10 → 10/10)

### From 5 → 6: Revenue Infrastructure ✦ Sprint 1
- [ ] Razorpay integrated (subscriptions + one-time payments)
- [ ] Pricing page shows real INR prices with working CTAs
- [ ] Usage counter visible in dashboard
- [ ] Upgrade modal triggers at limit
- [ ] Pre-auth idea capture via localStorage

### From 6 → 7: Trust Signals ✦ Sprint 2
- [ ] Share page (`/share/[token]`) loads real session data (not a stub)
- [ ] OG images render on Twitter/LinkedIn share
- [ ] Hero shows real screenshots (not skeleton)
- [ ] Social proof counters ("X founders, Y ideas analyzed")
- [ ] Share button on results page copies `/share/` URL

### From 7 → 8: Discovery Engine ✦ Sprint 3
- [ ] `/explore` gallery is live and SEO-indexed
- [ ] `/leaderboard` shows top ideas
- [ ] `/roast` feed is public and shareable
- [ ] Navigation updated with new pages

### From 8 → 9: Retention Loop ✦ Sprint 4
- [ ] 3-step onboarding wizard guides new users
- [ ] Idea iteration tracking shows score improvements
- [ ] Weekly email digest sends every Monday
- [ ] Checklist state persists and is meaningful

### From 9 → 9.5: Premium Value ✦ Sprint 5
- [ ] Team workspaces ship for Founder plan
- [ ] Investor one-pager export works (with payment gating)
- [ ] API access available with key management

### From 9.5 → 10: Launch Ready ✦ Sprint 6
- [ ] Full SEO metadata on all pages
- [ ] Sitemap + robots.txt deployed
- [ ] "Powered by IdeaForge" watermark on free exports
- [ ] Mobile responsive on all new pages
- [ ] Product Hunt assets ready
- [ ] 3 blog posts published
- [ ] Error boundaries + loading states on all routes

---

## 🚀 90-Day Growth Roadmap (Post-Build)

### Month 1 (During Sprints 1-2 build)
- Soft launch to 3 startup Discord/Slack communities
- Share on Twitter/LinkedIn with personal story
- Target: **100 signups, 3 paying users**

### Month 2 (Sprints 3-4 complete)
- **Product Hunt launch** (Tuesday, prepare 1 week before)
- 3 SEO blog posts live
- Outreach to 5 Indian startup incubators (IIM, T-Hub, NASSCOM)
- Target: **500 signups, ₹15k MRR**

### Month 3 (Sprints 5-6 complete)
- Partner with 2 startup newsletters
- Launch Discord/Slack community "Idea Validation India"
- First API client from incubator outreach
- Target: **1,000 signups, ₹40k MRR**

---

## 💡 Key Decisions Summary

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Payment gateway | **Razorpay** | India-first, UPI support, Subscriptions API |
| Currency | **INR** | Target Indian founders first, expand later |
| Free limit | **3 ideas/month** | At ₹30 cost/idea, 3 keeps acquisition cost at ₹90/user — still reasonable for conversion |
| Pro price | **₹499/mo** | Below IdeaBuddy ($18≈₹1,500), accessible to Indian founders |
| Email | **Resend** | Free tier covers 3k emails/mo, React email templates |
| OG Images | **@vercel/og** | Zero infra, works on Vercel edge |
| Cron | **Vercel Cron** | Free on Vercel hobby/pro plan |

---

> [!TIP]
> **Execution order matters.** Sprint 1 (Razorpay) is the single most important sprint — every user you acquire before payments work costs you ₹30+ with zero return. Build Sprint 1 first, deploy it, then continue. Do not launch publicly until Sprint 2 is complete.
