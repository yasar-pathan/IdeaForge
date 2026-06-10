import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, supabaseAdmin } from '@/backend/lib/supabase/server';

// Check if requester is the system admin
async function isAdminAuthorized() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.email !== 'admin@ideaforge.com') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// GET: List all users and their analyzed idea counts
export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [usersRes, sessionsRes] = await Promise.all([
      supabaseAdmin.from('users').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('idea_sessions').select('user_id'),
    ]);

    if (usersRes.error) throw usersRes.error;
    const users = usersRes.data || [];
    const sessions = sessionsRes.data || [];

    // Count ideas per user
    const ideaCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.user_id) {
        ideaCounts[s.user_id] = (ideaCounts[s.user_id] || 0) + 1;
      }
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name || 'Anonymous',
      plan: u.plan || 'free',
      created_at: u.created_at,
      subscription_status: u.subscription_status || 'inactive',
      ideasCount: ideaCounts[u.id] || 0,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('List users admin error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const plan = typeof body.plan === 'string' ? body.plan : 'free';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (!['free', 'pro', 'founder'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Create user in Supabase auth
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name || undefined,
        name: name || undefined,
      },
    });

    if (createError || !createData.user) {
      throw createError || new Error('Auth user creation failed');
    }

    const userId = createData.user.id;

    // Sync public.users record
    const { error: upsertError } = await supabaseAdmin.from('users').upsert(
      {
        id: userId,
        email,
        name: name || email.split('@')[0],
        plan,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      // Cleanup auth user if profile upsert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw upsertError;
    }

    return NextResponse.json({ 
      ok: true, 
      user: { id: userId, email, name, plan, created_at: new Date().toISOString(), ideasCount: 0 } 
    });
  } catch (error) {
    console.error('Create user admin error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing user
export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, email, name, plan } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (!['free', 'pro', 'founder'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // 1. Update auth user details
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      user_metadata: {
        full_name: name || undefined,
        name: name || undefined,
      },
    });

    if (authUpdateError) throw authUpdateError;

    // 2. Update profile table
    const { error: dbUpdateError } = await supabaseAdmin.from('users').update({
      email,
      name,
      plan,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (dbUpdateError) throw dbUpdateError;

    return NextResponse.json({ ok: true, user: { id, email, name, plan } });
  } catch (error) {
    console.error('Update user admin error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user
export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch the user's email to make sure we are not deleting ourselves
    const { data: userToDelete } = await supabaseAdmin.from('users').select('email').eq('id', id).maybeSingle();
    if (userToDelete?.email === 'admin@ideaforge.com') {
      return NextResponse.json({ error: 'Cannot delete the main admin account' }, { status: 400 });
    }

    // Delete user from Supabase auth. Cascade will delete profiles, sessions, and checklists automatically.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete user admin error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
