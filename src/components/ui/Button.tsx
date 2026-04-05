'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
  {
    variants: {
      variant: {
        primary:
          'rounded-full bg-gradient-to-r from-[#7C6EFA] to-[#A855F7] text-white shadow-[var(--shadow-glow)] hover:brightness-110 hover:scale-[1.02]',
        secondary:
          'rounded-full border border-[var(--border-bright)] bg-transparent text-[var(--text-accent)] hover:bg-[var(--accent-glow)]',
        ghost:
          'rounded-full bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]',
        danger:
          'rounded-full bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)]/20',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
