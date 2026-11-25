'use client';

import React, { useState, useEffect } from 'react';
import { Package, ImageOff } from 'lucide-react';
import * as vendorService from '@services/vendor.service';

export interface ProductThumbnailProps {
  src?: string | null;
  images?: string[] | string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
  showCountBadge?: boolean;
  priority?: boolean;
}

const SIZE_MAP: Record<string, string> = {
  xs: 'size-10',
  sm: 'size-12',
  md: 'size-16',
  lg: 'size-20',
  xl: 'size-24',
};

const ICON_SIZE_MAP: Record<string, string> = {
  xs: 'size-4',
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-8',
  xl: 'size-10',
};

export function ProductThumbnail({
  src,
  images,
  alt,
  size = 'md',
  className = '',
  showCountBadge = false,
}: ProductThumbnailProps) {
  // Normalize images list
  const imageList = vendorService.normalizeImageArray(images);
  const primaryRaw = src || (imageList.length > 0 ? imageList[0] : null);

  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [retryAttempted, setRetryAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // When primaryRaw changes, compute full image URL
  useEffect(() => {
    if (!primaryRaw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentSrc('');
      setHasError(false);
      setIsLoading(false);
      return;
    }

    const resolved = vendorService.getFullImageUrl(primaryRaw);
    setCurrentSrc(resolved);
    setHasError(false);
    setRetryAttempted(false);
    setIsLoading(true);
  }, [primaryRaw]);

  const sizeClass = SIZE_MAP[size] || size;
  const iconSizeClass = ICON_SIZE_MAP[size] || 'size-6';
  const extraCount = imageList.length > 1 ? imageList.length - 1 : 0;

  function handleImageError() {
    // If the image was requested relatively via /uploads/ and failed,
    // attempt once with direct backend origin as fallback
    if (!retryAttempted && currentSrc && !currentSrc.startsWith('data:') && !currentSrc.startsWith('blob:')) {
      setRetryAttempted(true);
      if (currentSrc.startsWith('/uploads')) {
        const backendOrigin = process.env.NEXT_PUBLIC_API_URL
          ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
          : 'http://localhost:3000';
        setCurrentSrc(`${backendOrigin}${currentSrc}`);
        return;
      }
    }

    // Both primary and retry failed
    setHasError(true);
    setIsLoading(false);
  }

  function handleImageLoad() {
    setIsLoading(false);
    setHasError(false);
  }

  return (
    <div
      className={`relative shrink-0 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center ${sizeClass} ${className}`}
    >
      {currentSrc && !hasError ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
              <Package className={`${iconSizeClass} text-slate-300`} />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSrc}
            alt={alt || 'Product Image'}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {showCountBadge && extraCount > 0 && (
            <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded-tl shadow-xs">
              +{extraCount}
            </span>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
          {hasError ? (
            <>
              <ImageOff className={`${iconSizeClass} text-slate-300`} />
              <span className="text-[8px] text-slate-400 font-medium mt-0.5 leading-none">No Photo</span>
            </>
          ) : (
            <>
              <Package className={`${iconSizeClass} text-slate-300`} />
              <span className="text-[8px] text-slate-400 font-medium mt-0.5 leading-none">No Photo</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
