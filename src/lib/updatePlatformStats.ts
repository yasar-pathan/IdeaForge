import { supabaseAdmin } from '@/lib/supabase/server';

export async function updatePlatformStats() {
  try {
    const [{ count: totalAnalyses }, { count: totalUsers }, { data: scores }] = await Promise.all([
      supabaseAdmin.from('idea_sessions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('success_probability').select('overall_score').not('overall_score', 'is', null),
    ]);

    const validScores = (scores ?? [])
      .map((s) => Number((s as { overall_score?: number }).overall_score ?? 0))
      .filter((n) => Number.isFinite(n) && n > 0);

    const avgSuccessScore = validScores.length
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

    await supabaseAdmin.from('platform_stats').upsert(
      {
        id: 1,
        total_analyses: totalAnalyses ?? 0,
        total_users: totalUsers ?? 0,
        avg_success_score: avgSuccessScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch (error) {
    console.error('updatePlatformStats failed:', error);
  }
}
