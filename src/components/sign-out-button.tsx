'use client';

import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase/client';

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className ?? 'text-sm text-zinc-400 hover:text-white'}
      onClick={async () => {
        const sb = createBrowserSupabase();
        await sb.auth.signOut();
        router.refresh();
        router.push('/');
      }}
    >
      Sign out
    </button>
  );
}
