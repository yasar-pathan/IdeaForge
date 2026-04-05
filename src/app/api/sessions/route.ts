import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    return NextResponse.json({ sessions: sessions || [] });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
