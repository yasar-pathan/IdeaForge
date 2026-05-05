import { NextResponse } from 'next/server';
import { getSessionUserId, supabaseAdmin } from '@/lib/supabase/server';
import { razorpay } from '@/lib/razorpay';

export async function POST() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('razorpay_subscription_id, plan')
      .eq('id', userId)
      .maybeSingle();

    const subscriptionId = user?.razorpay_subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    await (razorpay.subscriptions as unknown as { cancel: (id: string) => Promise<unknown> }).cancel(
      subscriptionId
    );

    await supabaseAdmin
      .from('users')
      .update({
        plan: 'free',
        subscription_status: 'cancelled',
        razorpay_subscription_id: null,
      })
      .eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('cancel-subscription error:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
