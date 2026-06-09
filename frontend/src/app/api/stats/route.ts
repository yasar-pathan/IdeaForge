import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabase/server';

export const revalidate = 3600;

export async function GET() {
  try {
    const [{ count: totalAnalyses }, { count: totalUsers }, { data: scores }] = await Promise.all([
      supabaseAdmin.from('idea_sessions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('success_probability').select('overall_score').not('overall_score', 'is', null),
    ]);

    const validScores = (scores ?? [])
      .map((s) => Number((s as { overall_score?: number }).overall_score ?? 0))
      .filter((n) => Number.isFinite(n) && n > 0);
    const avgScore = validScores.length
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

    // Best-effort cache table sync for cheap future reads.
    await supabaseAdmin.from('platform_stats').upsert(
      {
        id: 1,
        total_analyses: totalAnalyses ?? 0,
        total_users: totalUsers ?? 0,
        avg_success_score: avgScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      totalAnalyses: totalAnalyses ?? 0,
      avgScore,
    });
  } catch (error) {
    console.error('stats api error:', error);
    return NextResponse.json({ totalUsers: 0, totalAnalyses: 0, avgScore: 0 });
  }
}
