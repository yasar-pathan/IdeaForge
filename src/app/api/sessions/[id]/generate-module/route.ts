import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, supabaseAdmin } from '@/lib/supabase/server';
import { isWorkspaceModuleId, runSingleModule } from '@/lib/analysis/moduleRunner';

export const maxDuration = 300;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await req.json();
    const moduleId = typeof body.module === 'string' ? body.module.trim() : '';

    if (!moduleId || !isWorkspaceModuleId(moduleId)) {
      return NextResponse.json({ error: 'Invalid or missing module' }, { status: 400 });
    }

    const { data: session, error: sErr } = await supabaseAdmin
      .from('idea_sessions')
      .select('id, user_id, raw_idea, status')
      .eq('id', sessionId)
      .single();

    if (sErr || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rawIdea = String(session.raw_idea ?? '').trim();
    if (!rawIdea) {
      return NextResponse.json({ error: 'Session has no idea text' }, { status: 400 });
    }

    await runSingleModule(sessionId, rawIdea, moduleId);

    return NextResponse.json({ ok: true, module: moduleId });
  } catch (error) {
    console.error('generate-module:', error);
    const msg = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
