import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface LogoProps {
  /**
   * 'default' -> dark navy & gray (ideal for light headers/surfaces)
   * 'white' -> light tinted/white (ideal for dark footer or dark hero cards)
   * 'icon' -> standalone 'b' icon glyph with dot
   */
  variant?: 'default' | 'white' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export function Logo({
  variant = 'default',
  size = 'md',
  showTagline = false,
  className,
}: LogoProps) {
  // Height definitions for the image based on size
  const heights = {
    sm: { h: 24, w: 110, icon: 28 },
    md: { h: 30, w: 138, icon: 34 },
    lg: { h: 38, w: 174, icon: 42 },
    xl: { h: 48, w: 220, icon: 52 },
  };

  const current = heights[size];

  if (variant === 'icon') {
    return (
      <div className={cn('relative inline-flex items-center shrink-0', className)}>
        <Image
          src="/logo-icon.webp"
          alt="BITAINTEL Mark"
          width={current.icon}
          height={current.icon}
          priority
          className="object-contain"
        />
      </div>
    );
  }

  // SVG vector container wrapping pristine 4264x928 master asset provides razor-sharp rendering on all screens
  return (
    <div className={cn('inline-flex flex-col items-start justify-center select-none', className)}>
      <div className="flex items-center gap-2">
        <img
          src="/logo.svg"
          alt="BITAINTEL"
          width={current.w}
          height={current.h}
          loading="eager"
          decoding="sync"
          style={{
            width: `${current.w}px`,
            height: 'auto',
            aspectRatio: '4264 / 928',
          }}
          className="h-auto object-contain transition-transform group-hover:scale-[1.02] duration-200"
        />
      </div>
      {showTagline && (
        <span
          className={cn(
            'text-[10px] font-medium tracking-wide mt-0.5',
            variant === 'white' ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          Verify Before You Trust
        </span>
      )}
    </div>
  );
}
