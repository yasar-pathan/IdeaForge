import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, getSessionUserId, supabaseAdmin } from '@/backend/lib/supabase/server';

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

    let { data: user, error } = await supabaseAdmin
      .from('users')
      .select(
        'id,email,name,plan,analyses_used_this_month,created_at,subscription_status,plan_expires_at,razorpay_subscription_id'
      )
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      // Auto-sync/recreate the user profile if missing
      const sb = await createServerSupabase();
      const { data: { user: authUser } } = await sb.auth.getUser();
      if (authUser) {
        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '';
        const { data: newUser, error: insertError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: userId,
            email: authUser.email,
            name: name,
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .select(
            'id,email,name,plan,analyses_used_this_month,created_at,subscription_status,plan_expires_at,razorpay_subscription_id'
          )
          .single();
        if (insertError) {
          console.error('Auto-creation of user failed in profile GET:', insertError);
          return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }
        user = newUser;
      } else {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
    }

    const plan = String(user.plan ?? 'free');
    const used = Number(user.analyses_used_this_month ?? 0);
    const limit = monthlyAnalysisCap(plan);
    const { data: sessions } = await supabaseAdmin
      .from('idea_sessions')
      .select(
        `
        created_at,
        success_probability (overall_score)
      `
      )
      .eq('user_id', userId);

    const rows = (sessions ?? []) as Array<{
      created_at?: string;
      success_probability?: { overall_score?: number | null } | null;
    }>;
    const now = new Date();
    const thisMonth = rows.filter((r) => {
      if (!r.created_at) return false;
      const d = new Date(r.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const scores = rows
      .map((r) => Number(r.success_probability?.overall_score ?? 0))
      .filter((n) => Number.isFinite(n) && n > 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highestScore = scores.length ? Math.max(...scores) : 0;

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email ?? '',
        name: user.name ?? '',
        plan,
        created_at: user.created_at,
      },
      usage: {
        used,
        limit,
        remaining: Math.max(0, limit - used),
      },
      activity: {
        totalAnalyses: rows.length,
        thisMonth,
        avgScore,
        highestScore,
      },
      billing: {
        subscriptionStatus: String(user.subscription_status ?? 'inactive'),
        nextBillingDate: user.plan_expires_at ?? null,
        razorpaySubscriptionId: user.razorpay_subscription_id ?? null,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json()) as { name?: unknown; email?: unknown };
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined;

    if (name === undefined && email === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    if (email !== undefined && !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) patch.name = name;
    if (email !== undefined) patch.email = email;

    const { data: updated, error } = await supabaseAdmin
      .from('users')
      .update(patch)
      .eq('id', userId)
      .select(
        'id,email,name,plan,analyses_used_this_month,created_at,subscription_status,plan_expires_at,razorpay_subscription_id'
      )
      .single();

    if (error) throw error;

    // Keep Supabase Auth profile synced best-effort.
    if (name !== undefined || email !== undefined) {
      const sb = await createServerSupabase();
      await sb.auth.updateUser({
        email,
        data: name !== undefined ? { full_name: name, name } : undefined,
      });
    }

    const plan = String(updated.plan ?? 'free');
    const used = Number(updated.analyses_used_this_month ?? 0);
    const limit = monthlyAnalysisCap(plan);

    return NextResponse.json({
      profile: {
        id: updated.id,
        email: updated.email ?? '',
        name: updated.name ?? '',
        plan,
        created_at: updated.created_at,
      },
      usage: {
        used,
        limit,
        remaining: Math.max(0, limit - used),
      },
      billing: {
        subscriptionStatus: String(updated.subscription_status ?? 'inactive'),
        nextBillingDate: updated.plan_expires_at ?? null,
        razorpaySubscriptionId: updated.razorpay_subscription_id ?? null,
      },
    });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
