import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabase/server';

/** Creates a fully confirmed user (no email verification). Uses service role on server only. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Valid phone number is required (at least 10 digits)' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name || undefined,
        name: name || undefined,
        phone: phone || undefined,
      },
    });

    if (error) {
      const msg =
        error.message.includes('already been registered') || error.message.includes('already exists')
          ? 'An account with this email already exists'
          : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { 
        error: 'Registration failed', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}
