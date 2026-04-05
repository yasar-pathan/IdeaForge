'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Menu, X, Hexagon, LayoutDashboard, LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it Works' },
  { href: '/#pricing', label: 'Pricing' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sb = createBrowserSupabase();
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const hideOnMinimal =
    pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  async function signOut() {
    const sb = createBrowserSupabase();
    await sb.auth.signOut();
    router.refresh();
    router.push('/');
  }

  if (hideOnMinimal) return null;

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-[100] transition-all duration-300',
        scrolled
          ? 'border-b border-[var(--border)] bg-[rgba(4,4,10,0.85)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Hexagon className="h-8 w-8 text-[var(--accent-primary)]" strokeWidth={1.5} />
          <span className="font-display text-xl font-bold gradient-text">IdeaForge</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-bright)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)]"
                  >
                    {(user.email?.[0] ?? '?').toUpperCase()}
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="z-[150] min-w-[180px] rounded-xl border border-[var(--border-bright)] bg-[var(--bg-elevated)] p-1 shadow-xl"
                    sideOffset={6}
                  >
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] outline-none hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                      onSelect={() => signOut()}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Start Free →</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-[var(--text-primary)]"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-4 md:hidden">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="block py-2 text-[var(--text-secondary)]"
              onClick={() => setOpen(false)}
            >
              {n.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full" onClick={() => signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setOpen(false)}>
                  <Button className="w-full">Start Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
