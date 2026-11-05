import { cn } from '@/lib/utils';

export function Separator({
  orientation = 'horizontal',
  className,
}: {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === 'horizontal'
          ? 'h-px w-full bg-slate-200/80'
          : 'h-full w-px bg-slate-200/80',
        className
      )}
    />
  );
}
