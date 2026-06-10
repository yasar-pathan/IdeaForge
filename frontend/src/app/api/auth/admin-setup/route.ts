import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (email !== 'admin@ideaforge.com' || password !== 'yasar@ideaforge555') {
      return NextResponse.json({ error: 'Unauthorized credentials' }, { status: 401 });
    }

    // List users in Supabase Auth to find if the admin user exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const adminUser = users.find((u) => u.email === 'admin@ideaforge.com');

    let adminId: string;

    if (!adminUser) {
      // Create the admin user
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: 'System Admin',
          name: 'System Admin',
        },
      });
      if (createError || !createData.user) {
        throw createError || new Error('User creation returned empty payload');
      }
      adminId = createData.user.id;
    } else {
      adminId = adminUser.id;
      // Update password to ensure it matches
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(adminId, {
        password,
      });
      if (updateError) throw updateError;
    }

    // Sync public.users record
    const { error: upsertError } = await supabaseAdmin.from('users').upsert(
      {
        id: adminId,
        email: email,
        name: 'System Admin',
        plan: 'founder',
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertError) throw upsertError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { 
        error: 'Admin setup failed', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
