import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabase } from '@/lib/supabase/server';
import { PLANS } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(bodyText);
    const payload = event.payload;

    const sb = await createServerSupabase();

    if (event.event === 'subscription.activated') {
      const sub = payload.subscription.entity;
      const customerId = sub.customer_id;
      const planId = sub.plan_id as string | undefined;
      const planFromNotes = sub?.notes?.ideaforge_plan as 'pro' | 'founder' | undefined;
      const plan =
        planFromNotes ??
        (planId === PLANS.founder.id ? 'founder' : planId === PLANS.pro.id ? 'pro' : 'pro');
      await sb.from('users').update({
        plan,
        subscription_status: 'active',
        razorpay_subscription_id: sub.id,
      }).eq('razorpay_customer_id', customerId);
    } else if (event.event === 'subscription.charged') {
      const sub = payload.subscription.entity;
      const customerId = sub.customer_id;
      
      const expiresAt = new Date(sub.current_end * 1000).toISOString();

      await sb.from('users').update({
        analyses_used_this_month: 0,
        plan_expires_at: expiresAt,
      }).eq('razorpay_customer_id', customerId);
    } else if (event.event === 'subscription.cancelled') {
      const sub = payload.subscription.entity;
      const customerId = sub.customer_id;
      await sb.from('users').update({
        plan: 'free',
        subscription_status: 'cancelled',
      }).eq('razorpay_customer_id', customerId);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
