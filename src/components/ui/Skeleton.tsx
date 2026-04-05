import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'card' | 'circle' | 'rect';

const variantClass: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full',
  card: 'h-32 w-full',
  circle: 'h-12 w-12 rounded-full',
  rect: 'h-24 w-full',
};

export function Skeleton({
  className,
  variant = 'rect',
}: {
  className?: string;
  variant?: SkeletonVariant;
}) {
  return <div className={cn('skeleton', variantClass[variant], className)} />;
}
