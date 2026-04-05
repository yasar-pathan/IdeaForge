import type { Metadata } from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { GlobalShortcuts } from '@/components/layout/GlobalShortcuts';
import { TooltipProvider } from '@/components/ui/Tooltip';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'IdeaForge — AI-Powered Startup Idea Analyzer',
  description:
    'Turn your startup idea into a complete investor-ready analysis package in under 2 minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} font-body noise-bg min-h-screen antialiased`}
      >
        <TooltipProvider>
          <ScrollProgress />
          <GlobalShortcuts />
          <Navbar />
          <main className="relative z-[1] min-h-screen">{children}</main>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body), system-ui, sans-serif',
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
