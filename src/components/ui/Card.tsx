import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-[var(--radius-lg)] transition-all duration-300', {
  variants: {
    variant: {
      default:
        'bg-[var(--bg-card)] border border-[var(--border)] shadow-[var(--shadow-card)] card-hover',
      elevated:
        'bg-[var(--bg-elevated)] border border-[var(--border-bright)] shadow-[0_8px_40px_rgba(0,0,0,0.45)]',
      ghost: 'bg-transparent border border-dashed border-[var(--border)]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}
