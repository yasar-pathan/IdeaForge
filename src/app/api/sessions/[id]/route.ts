import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    const { id: sessionId } = await params;

    const { data: session } = await supabaseAdmin
      .from('idea_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (!session.is_public) {
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (session.user_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const [
      moduleStatus,
      pitchSpeech,
      marketResearch,
      competitorIntelligence,
      successProbability,
      featureRecommendations,
      domainSuggestions,
      roastAnalysis,
      validationChecklist,
      monetizationStrategies,
      teamStructure,
      budgetBreakdown,
      uiFlow,
      pptSlides,
    ] = await Promise.all([
      supabaseAdmin.from('module_status').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('pitch_speech').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('market_research').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('competitor_intelligence').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('success_probability').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('feature_recommendations').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('domain_suggestions').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('roast_analysis').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('validation_checklist').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('monetization_strategies').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('team_structure').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('budget_breakdown').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin.from('ui_flow').select('*').eq('session_id', sessionId).single(),
      supabaseAdmin
        .from('ppt_slides')
        .select('*')
        .eq('session_id', sessionId)
        .order('slide_number', { ascending: true }),
    ]);

    return NextResponse.json({
      session,
      module_status: moduleStatus.data,
      pitch_speech: pitchSpeech.data,
      market_research: marketResearch.data,
      competitor_intelligence: competitorIntelligence.data,
      success_probability: successProbability.data,
      feature_recommendations: featureRecommendations.data,
      domain_suggestions: domainSuggestions.data,
      roast_analysis: roastAnalysis.data,
      validation_checklist: validationChecklist.data,
      monetization_strategies: monetizationStrategies.data,
      team_structure: teamStructure.data,
      budget_breakdown: budgetBreakdown.data,
      ui_flow: uiFlow.data,
      ppt_slides: pptSlides.data ?? [],
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: sessionId } = await params;
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const idea_title =
      typeof body.idea_title === 'string' ? body.idea_title.trim() || null : undefined;
    const idea_category =
      typeof body.idea_category === 'string'
        ? body.idea_category.trim() || null
        : body.idea_category === null
          ? null
          : undefined;

    if (idea_title === undefined && idea_category === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: row, error: fetchErr } = await supabaseAdmin
      .from('idea_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (row.user_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (idea_title !== undefined) patch.idea_title = idea_title;
    if (idea_category !== undefined) patch.idea_category = idea_category;

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('idea_sessions')
      .update(patch)
      .eq('id', sessionId)
      .select('id, idea_title, idea_category, status, created_at')
      .single();

    if (updErr) throw updErr;
    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error('Patch session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: sessionId } = await params;

    const { data: row, error: fetchErr } = await supabaseAdmin
      .from('idea_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (row.user_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { error: delErr } = await supabaseAdmin.from('idea_sessions').delete().eq('id', sessionId);
    if (delErr) throw delErr;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
