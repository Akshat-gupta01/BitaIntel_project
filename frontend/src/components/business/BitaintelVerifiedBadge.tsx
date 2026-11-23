import React from 'react';
import { cn } from '@/lib/utils';

export interface BitaintelVerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

const sizeMap = {
  sm: {
    container: 'size-4 -bottom-1 -right-1 p-[2px] border-[1.5px]',
    img: 'size-2.5',
  },
  md: {
    container: 'size-5 -bottom-1 -right-1 p-[3px] border-2',
    img: 'size-3',
  },
  lg: {
    container: 'size-7 -bottom-1.5 -right-1.5 p-1 border-2',
    img: 'size-4',
  },
};

export function BitaintelVerifiedBadge({
  size = 'md',
  className,
  title = 'Verified by BITAINTEL · Premium Subscriber',
}: BitaintelVerifiedBadgeProps) {
  const dims = sizeMap[size];

  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        'absolute z-10 grid place-items-center rounded-full bg-white border-primary-600 ring-2 ring-white shadow-[0_3px_10px_rgba(29,78,216,0.28)] transition-transform duration-200 group-hover:scale-105 select-none',
        dims.container,
        className
      )}
    >
      <img
        src="/logo-icon.webp"
        alt="Verified by BITAINTEL"
        className={cn('object-contain block', dims.img)}
      />
    </span>
  );
}

