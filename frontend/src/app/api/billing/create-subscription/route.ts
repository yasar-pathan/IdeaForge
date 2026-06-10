import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, getSessionUserId, supabaseAdmin } from '@/backend/lib/supabase/server';
import { razorpay, PLANS } from '@/backend/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId } = await req.json();
    if (!planId || (planId !== 'pro' && planId !== 'founder')) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const sb = await createServerSupabase();
    let { data: user } = await sb.from('users').select('*').eq('id', userId).maybeSingle();
    
    if (!user) {
      // Auto-sync/recreate the user from Supabase Auth in case the database trigger was skipped
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
          .select()
          .single();
        if (insertError) {
          console.error('Auto-creation of user failed in create-subscription:', insertError);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        user = newUser;
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    const currentPlan = String(user.plan ?? 'free');
    if (currentPlan === 'founder') {
      return NextResponse.json(
        { error: 'You are already on Founder plan. No further upgrade available.' },
        { status: 400 }
      );
    }
    if (currentPlan === 'pro' && planId === 'pro') {
      return NextResponse.json(
        { error: 'You are already on Pro plan. Upgrade to Founder instead.' },
        { status: 400 }
      );
    }

    let customerId = user.razorpay_customer_id;
    if (!customerId) {
      const customer = await razorpay.customers.create({
        email: user.email,
        name: user.name || '',
      });
      customerId = customer.id;
      await sb.from('users').update({ razorpay_customer_id: customerId }).eq('id', userId);
    }

    type CreateSubscriptionInput = Parameters<typeof razorpay.subscriptions.create>[0];
    const input = {
      plan_id: PLANS[planId as keyof typeof PLANS].id,
      customer_id: customerId,
      total_count: 120, // 10 years
      customer_notify: 1,
      notes: { ideaforge_plan: planId },
    } as unknown as CreateSubscriptionInput;

    const subscription = await razorpay.subscriptions.create(input);

    const subscriptionId = (subscription as unknown as { id?: string }).id;
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    return NextResponse.json({ subscriptionId });
  } catch (err: unknown) {
    console.error('Subscription error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
