import { NextResponse } from 'next/server';
import { getSessionUserId, supabaseAdmin } from '@/lib/supabase/server';

function monthlyAnalysisCap(plan: string | null | undefined): number {
  if (process.env.IDEAFORGE_UNLIMITED_ANALYSES === 'true') return 999_999;
  if (plan === 'pro') return 15;
  if (plan === 'founder') return 999_999;
  const raw = process.env.IDEAFORGE_FREE_ANALYSIS_LIMIT?.trim();
  if (raw) {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 3;
}

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('plan, analyses_used_this_month')
      .eq('id', userId)
      .maybeSingle();

    const plan = (user?.plan as string | null | undefined) ?? 'free';
    const used = user?.analyses_used_this_month ?? 0;
    const limit = monthlyAnalysisCap(plan);

    const { data: sessions, error } = await supabaseAdmin
      .from('idea_sessions')
      .select(
        `
        id, raw_idea, idea_title, idea_category, status, created_at,
        success_probability (overall_score, verdict)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({
      sessions: sessions || [],
      usage: { plan, used, limit, remaining: Math.max(0, limit - used) },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
