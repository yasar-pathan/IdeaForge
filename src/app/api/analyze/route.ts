import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, getSessionUserId } from '@/lib/supabase/server';

export const maxDuration = 60;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function serviceRoleConfigured(): boolean {
  const s = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  const a = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
  return s.length > 0 && s !== a;
}

function monthlyAnalysisCap(plan: string | null | undefined): number {
  if (process.env.IDEAFORGE_UNLIMITED_ANALYSES === 'true') {
    return 999_999;
  }
  if (plan && plan !== 'free') {
    return 999;
  }
  const raw = process.env.IDEAFORGE_FREE_ANALYSIS_LIMIT?.trim();
  if (raw) {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0) {
      return n;
    }
  }
  return 3;
}

/** Creates an idea session + empty module_status only. User generates each module from /workspace/[id]. */
export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!serviceRoleConfigured()) {
      return NextResponse.json(
        {
          error:
            'Server misconfigured: set SUPABASE_SERVICE_ROLE_KEY in .env.local (service_role, not anon).',
        },
        { status: 500 }
      );
    }

    const { idea } = await req.json();
    if (!idea || idea.trim().length < 10) {
      return NextResponse.json({ error: 'Idea is too short' }, { status: 400 });
    }

    const sb = await createServerSupabase();

    let { data: user, error: userSelectErr } = await sb
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userSelectErr) {
      console.error('users select:', userSelectErr.message);
    }

    if (!user) {
      const {
        data: { user: authUser },
        error: guErr,
      } = await sb.auth.getUser();
      if (guErr || !authUser || authUser.id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const email = authUser.email ?? `${userId}@placeholder.ideaforge.local`;
      const name =
        (authUser.user_metadata?.full_name as string) ||
        (authUser.user_metadata?.name as string) ||
        email.split('@')[0] ||
        'User';

      const { data: upserted, error: upsertErr } = await sb
        .from('users')
        .upsert(
          {
            id: userId,
            email,
            name,
            avatar_url: (authUser.user_metadata?.avatar_url as string) || null,
            plan: 'free',
            analyses_used_this_month: 0,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (upsertErr) {
        console.error('users upsert failed:', upsertErr.message);
        const msg = upsertErr.message ?? '';
        const clerkLegacy = msg.includes('clerk_id');
        return NextResponse.json(
          {
            error: clerkLegacy
              ? 'Legacy clerk_id column on public.users — run src/lib/supabase/drop_clerk_legacy.sql'
              : 'Could not create your profile',
            detail: upsertErr.message,
          },
          { status: 500 }
        );
      }
      user = upserted;
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to ensure user' }, { status: 500 });
    }

    const limit = monthlyAnalysisCap(user.plan as string | null | undefined);

    if ((user.analyses_used_this_month ?? 0) >= limit) {
      return NextResponse.json(
        {
          error: 'Monthly limit reached. Upgrade to Pro for unlimited analyses.',
          hint: 'Dev: IDEAFORGE_UNLIMITED_ANALYSES=true in .env.local',
        },
        { status: 429 }
      );
    }

    const { data: session, error: sessionError } = await sb
      .from('idea_sessions')
      .insert({
        user_id: userId,
        raw_idea: idea.trim(),
        status: 'processing',
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error('idea_sessions insert:', sessionError?.message);
      return NextResponse.json(
        { error: 'Failed to create session', detail: sessionError?.message },
        { status: 500 }
      );
    }

    const { error: modErr } = await sb.from('module_status').insert({ session_id: session.id });
    if (modErr) {
      console.error('module_status insert:', modErr.message);
      return NextResponse.json({ error: 'Failed to create module tracker', detail: modErr.message }, { status: 500 });
    }

    const { error: usageErr } = await sb
      .from('users')
      .update({ analyses_used_this_month: (user.analyses_used_this_month || 0) + 1 })
      .eq('id', userId);
    if (usageErr) {
      console.error('users usage update:', usageErr.message);
    }

    return NextResponse.json({ session_id: session.id, status: 'processing' });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
