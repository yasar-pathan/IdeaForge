import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;

    const { data: session } = await supabaseAdmin
      .from('idea_sessions')
      .select('id, status, idea_title, idea_category, user_id')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: moduleStatus } = await supabaseAdmin
      .from('module_status')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    const completedModules = moduleStatus
      ? Object.entries(moduleStatus)
          .filter(
            ([key, val]) =>
              val === true &&
              key !== 'id' &&
              key !== 'session_id' &&
              key !== 'created_at' &&
              key !== 'updated_at'
          )
          .map(([key]) => key)
      : [];

    const totalModules = 13;
    const progress = Math.round((completedModules.length / totalModules) * 100);

    return NextResponse.json({
      session_id: sessionId,
      status: session.status,
      idea_title: session.idea_title,
      idea_category: session.idea_category,
      completed_modules: completedModules,
      progress,
      total_modules: totalModules,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
