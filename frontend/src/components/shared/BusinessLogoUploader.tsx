'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ImagePlus,
  RefreshCw,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { uploadBusinessLogo } from '../../../services/vendor.service';

export function computeInitials(name?: string): string {
  const cleaned = (name || '').trim();
  if (!cleaned) return 'CO';
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

interface BusinessAvatarProps {
  logoUrl?: string;
  businessName?: string;
  fallbackInitials?: string;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
}

export function BusinessAvatar({
  logoUrl,
  businessName,
  fallbackInitials,
  className,
  imgClassName,
  textClassName,
}: BusinessAvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const hasValidLogo = Boolean(logoUrl && logoUrl.trim().length > 0 && !imgError);
  const initials = fallbackInitials || computeInitials(businessName);

  if (hasValidLogo) {
    return (
      <div
        className={cn(
          'grid place-items-center overflow-hidden bg-white border border-slate-200/90 shadow-xs shrink-0',
          className
        )}
      >
        <img
          src={logoUrl}
          alt={businessName ? `${businessName} Logo` : 'Company Logo'}
          onError={() => setImgError(true)}
          className={cn('h-full w-full object-contain p-1.5', imgClassName)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid place-items-center bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 text-white font-black shadow-xs shrink-0 select-none',
        textClassName,
        className
      )}
    >
      {initials}
    </div>
  );
}

interface BusinessLogoUploaderProps {
  logoUrl?: string;
  businessName?: string;
  onChange: (newLogoUrl: string) => void;
  title?: string;
  description?: string;
  className?: string;
}

const ACCEPTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
]);

async function optimizeImageFileToDataUrl(file: File): Promise<string> {
  // Read SVGs directly without canvas rasterization
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
    });
  }

  // Downscale raster images cleanly (max 512px) so localStorage footprint remains lightweight
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const maxDim = 512;
        let targetW = img.width || maxDim;
        let targetH = img.height || maxDim;

        if (targetW > maxDim || targetH > maxDim) {
          const ratio = Math.min(maxDim / targetW, maxDim / targetH);
          targetW = Math.max(1, Math.round(targetW * ratio));
          targetH = Math.max(1, Math.round(targetH * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Preserve transparency for PNG/WebP, compress JPEG cleanly
        const outputType =
          file.type === 'image/jpeg' || file.type === 'image/jpg'
            ? 'image/jpeg'
            : 'image/png';
        const optimized = canvas.toDataURL(outputType, 0.9);
        resolve(optimized);
      };
      img.onerror = () => reject(new Error('Invalid or corrupted image file.'));
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(new Error('Could not read selected image.'));
    reader.readAsDataURL(file);
  });
}

export function BusinessLogoUploader({
  logoUrl,
  businessName,
  onChange,
  title = 'Company Logo / Corporate Brand Mark',
  description = 'Displayed on your verified business dossier, directory cards, and procurement profile. Supports PNG, JPG, WebP, or SVG (max 5 MB).',
  className,
}: BusinessLogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setPreviewError(false);
  }, [logoUrl]);

  const hasCustomLogo = Boolean(logoUrl && logoUrl.trim().length > 0 && !previewError);

  async function processFile(file: File | undefined) {
    if (!file) return;

    if (!ACCEPTED_MIME_TYPES.has(file.type)) {
      toast.error('Unsupported Image Format', {
        description: 'Please upload a PNG, JPG, WebP, or SVG company logo.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image Too Large', {
        description: 'Please choose an image smaller than 5 MB.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      let finalUrl = '';
      try {
        finalUrl = await uploadBusinessLogo(file);
      } catch (uploadErr) {
        console.warn('Backend image upload fallback to local data URL:', uploadErr);
      }
      if (!finalUrl) {
        finalUrl = await optimizeImageFileToDataUrl(file);
      }
      onChange(finalUrl);
      setPreviewError(false);
      toast.success(hasCustomLogo ? 'Company Logo Replaced' : 'Company Logo Uploaded', {
        description: `${file.name} is now set as your official business mark.`,
      });
    } catch (err) {
      toast.error('Upload Failed', {
        description: err instanceof Error ? err.message : 'Unable to process this image.',
      });
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleRemoveLogo() {
    onChange('');
    setPreviewError(false);
    if (inputRef.current) inputRef.current.value = '';
    toast.info('Company Logo Removed', {
      description: 'Reverted to default company monogram initials.',
    });
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        void processFile(file);
      }}
      className={cn(
        'rounded-2xl border p-4 sm:p-5 transition-all',
        dragActive
          ? 'border-primary-500 bg-primary-50/70 ring-2 ring-primary-200'
          : 'border-slate-200/90 bg-slate-50/70',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          void processFile(file);
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          {/* Interactive Logo Preview Square */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            title={hasCustomLogo ? 'Click to replace company logo' : 'Click to upload company logo'}
            className="group relative size-20 shrink-0 rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {hasCustomLogo ? (
              <div className="size-full bg-white border border-slate-200 grid place-items-center p-2 shadow-2xs">
                <img
                  src={logoUrl}
                  alt={businessName ? `${businessName} Logo` : 'Company Logo'}
                  onError={() => setPreviewError(true)}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="size-full bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 text-white grid place-items-center text-xl font-black shadow-xs">
                {businessName ? computeInitials(businessName) : <Building2 className="size-7 text-white/85" />}
              </div>
            )}

            <span className="absolute inset-0 bg-slate-950/55 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-[10px] font-bold text-white">
              <span className="inline-flex flex-col items-center gap-1">
                <UploadCloud className="size-4" />
                <span>{hasCustomLogo ? 'Replace' : 'Upload'}</span>
              </span>
            </span>
          </button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h4>
              {hasCustomLogo ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="size-3" />
                  Logo Active
                </span>
              ) : (
                <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  Monogram Fallback
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 max-w-xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant={hasCustomLogo ? 'secondary' : 'primary'}
            isLoading={isProcessing}
            onClick={() => inputRef.current?.click()}
            icon={
              hasCustomLogo ? (
                <RefreshCw className="size-3.5 text-primary-600" />
              ) : (
                <ImagePlus className="size-3.5" />
              )
            }
          >
            {hasCustomLogo ? 'Replace Logo' : 'Add Logo'}
          </Button>

          {hasCustomLogo && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="size-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

