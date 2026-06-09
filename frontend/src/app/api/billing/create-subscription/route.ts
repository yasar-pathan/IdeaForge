import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, getSessionUserId } from '@/backend/lib/supabase/server';
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
    const { data: user } = await sb.from('users').select('*').eq('id', userId).single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

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
