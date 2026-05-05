import { NextResponse } from 'next/server';
import { createServerSupabase, getSessionUserId } from '@/lib/supabase/server';

export async function POST() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sb = await createServerSupabase();
    const { data: user } = await sb.from('users').select('razorpay_customer_id').eq('id', userId).single();
    
    if (!user || !user.razorpay_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // Since Razorpay doesn't have a direct customer portal link generation like Stripe,
    // we return a standard internal dashboard link or handle custom cancel logic elsewhere.
    return NextResponse.json({ url: '/dashboard' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
