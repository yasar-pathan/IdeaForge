import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]',
        success: 'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]/30',
        warning: 'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]/30',
        danger: 'bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]/30',
        accent:
          'bg-[var(--accent-glow)] text-[var(--text-accent)] border border-[var(--accent-primary)]/40',
        outline: 'border border-[var(--border-bright)] text-[var(--text-secondary)] bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
