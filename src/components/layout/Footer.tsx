import Link from 'next/link';
import { Hexagon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Hexagon className="h-7 w-7 text-[var(--accent-primary)]" strokeWidth={1.5} />
              <span className="font-display text-lg font-bold gradient-text">IdeaForge</span>
            </div>
            <p className="max-w-xs text-sm text-[var(--text-secondary)]">
              AI-powered startup analysis — from pitch to budget in minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 text-sm">
            <div>
              <p className="mb-3 font-medium text-[var(--text-primary)]">Product</p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li>
                  <a href="/#features" className="hover:text-[var(--text-primary)]">
                    Features
                  </a>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[var(--text-primary)]">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium text-[var(--text-primary)]">Account</p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li>
                  <Link href="/sign-in" className="hover:text-[var(--text-primary)]">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-[var(--text-primary)]">
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium text-[var(--text-primary)]">Legal</p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li>
                  <span className="cursor-default opacity-60">Privacy (soon)</span>
                </li>
                <li>
                  <span className="cursor-default opacity-60">Terms (soon)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-12 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} IdeaForge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
