import { NextResponse } from 'next/server';
import { createServerSupabase, supabaseAdmin } from '@/backend/lib/supabase/server';
import { getTrafficStats, trafficTracker } from '@/frontend/lib/traffic';

export async function GET() {
  try {
    // 1. Authenticate & Authorize the caller
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || user.email !== 'admin@ideaforge.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch total users, total sessions, and average scores from DB
    const [
      { count: totalUsers },
      { count: totalSessions },
      { data: scores },
      { data: usersList },
      { data: sessionsList }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('idea_sessions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('success_probability').select('overall_score').not('overall_score', 'is', null),
      supabaseAdmin.from('users').select('created_at, plan'),
      supabaseAdmin.from('idea_sessions').select('created_at, idea_category')
    ]);

    const users = usersList || [];
    const sessions = sessionsList || [];

    // Calculate Average Success Score
    const validScores = (scores ?? [])
      .map((s) => Number((s as { overall_score?: number }).overall_score ?? 0))
      .filter((n) => Number.isFinite(n) && n > 0);
    const avgScore = validScores.length
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

    // Calculate Plan Breakdown
    const planBreakdown = {
      free: users.filter((u) => u.plan === 'free' || !u.plan).length,
      pro: users.filter((u) => u.plan === 'pro').length,
      founder: users.filter((u) => u.plan === 'founder').length,
    };

    // Calculate Category Distribution
    const categoryCount: Record<string, number> = {};
    sessions.forEach((s) => {
      const cat = s.idea_category?.trim() || 'Other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories

    // Calculate 7-Day Timeline for Signups and Analyses
    interface TimelineItem {
      date: string;
      dateKey: string;
      signups: number;
      analyses: number;
      visitors: number;
      uniqueUsers: number;
    }
    const timeline: TimelineItem[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // Read real traffic from memory-based tracker
      const visitors = trafficTracker.dailyVisits[dateString] || 0;
      const uniqueUsers = trafficTracker.dailyUnique[dateString]?.size || 0;

      timeline.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateKey: dateString,
        signups: 0,
        analyses: 0,
        visitors,
        uniqueUsers,
      });
    }

    // Populate actual DB user creations and sessions in the timeline
    users.forEach((u) => {
      if (!u.created_at) return;
      const dateString = u.created_at.split('T')[0];
      const day = timeline.find((t) => t.dateKey === dateString);
      if (day) day.signups++;
    });

    sessions.forEach((s) => {
      if (!s.created_at) return;
      const dateString = s.created_at.split('T')[0];
      const day = timeline.find((t) => t.dateKey === dateString);
      if (day) day.analyses++;
    });

    // Recent Activity: latest 10 idea sessions with user info and overall score
    const { data: recentSessions, error: recentError } = await supabaseAdmin
      .from('idea_sessions')
      .select(`
        id,
        idea_title,
        idea_category,
        status,
        created_at,
        users (email, name),
        success_probability (overall_score, verdict)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    const formattedRecentActivity = (recentSessions || []).map((s: any) => ({
      id: s.id,
      title: s.idea_title || 'Untitled Idea',
      category: s.idea_category || 'Other',
      status: s.status,
      created_at: s.created_at,
      userEmail: s.users?.email || 'unknown@user.com',
      userName: s.users?.name || 'Anonymous',
      score: s.success_probability?.overall_score ?? null,
      verdict: s.success_probability?.verdict ?? null,
    }));

    // Get actual traffic stats from in-memory logs
    const trafficStats = getTrafficStats();
    const currentActiveUsers = trafficStats.activeUsers;
    const dailyTotalVisitors = trafficStats.todayVisits;
    const dailyTotalUnique = trafficStats.todayUnique;

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      totalSessions: totalSessions ?? 0,
      avgScore,
      currentActiveUsers,
      dailyVisitors: dailyTotalVisitors,
      uniqueUsers: dailyTotalUnique,
      planBreakdown,
      categoryDistribution,
      timeline,
      recentActivity: formattedRecentActivity,
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
