import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSessionUserId, supabaseAdmin } from '@/backend/lib/supabase/server';
import { razorpay } from '@/backend/lib/razorpay';

type RazorpaySubscription = {
  id?: string;
  status?: string;
  current_end?: number;
  notes?: { ideaforge_plan?: string };
};

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json();

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_payment_id + '|' + razorpay_subscription_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const subscription = (await razorpay.subscriptions.fetch(
      razorpay_subscription_id
    )) as unknown as RazorpaySubscription;
    const planFromNotes = subscription.notes?.ideaforge_plan;
    const plan: 'pro' | 'founder' | 'free' =
      planFromNotes === 'founder' ? 'founder' : planFromNotes === 'pro' ? 'pro' : 'pro';

    const currentEnd = subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null;

    await supabaseAdmin
      .from('users')
      .update({
        plan,
        subscription_status: subscription.status === 'active' ? 'active' : 'active',
        razorpay_subscription_id: subscription.id ?? razorpay_subscription_id,
        plan_expires_at: currentEnd,
      })
      .eq('id', userId);

    return NextResponse.json({ success: true, plan });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
