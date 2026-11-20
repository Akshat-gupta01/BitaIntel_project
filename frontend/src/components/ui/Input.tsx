import React, { type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={cn(
            'block w-full min-h-11 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md outline-none transition-all duration-200 focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-glow)] disabled:cursor-not-allowed disabled:opacity-50',
            icon ? 'pl-10' : undefined,
            (rightIcon || error) ? 'pr-10' : undefined,
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : undefined,
            className
          )}
          {...props}
        />
        {error ? (
          <span className="pointer-events-none absolute right-3.5 text-red-500">
            <AlertCircle className="size-4" />
          </span>
        ) : (
          rightIcon && (
            <span className="absolute right-3.5 text-slate-400">
              {rightIcon}
            </span>
          )
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(
          'block w-full rounded-2xl border border-slate-200/90 bg-white/90 p-4 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-md outline-none transition-all duration-200 focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-glow)] disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
