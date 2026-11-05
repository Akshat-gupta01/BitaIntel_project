'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  label?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showValueBadge?: boolean;
  valueFormatter?: (val: number) => string;
  error?: string;
}

export function Slider({
  label,
  value,
  defaultValue = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  showValueBadge = true,
  valueFormatter,
  className,
  error,
  disabled,
  id,
  ...props
}: SliderProps) {
  const generatedId = useId();
  const sliderId = id || generatedId;

  const [internalValue, setInternalValue] = React.useState<number>(
    value !== undefined ? value : defaultValue
  );

  const currentValue = value !== undefined ? value : internalValue;
  const percentage = Math.min(100, Math.max(0, ((currentValue - min) / (max - min)) * 100));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (value === undefined) {
      setInternalValue(num);
    }
    onChange?.(num);
  };

  const formattedDisplay = valueFormatter
    ? valueFormatter(currentValue)
    : `${currentValue}${unit ? ` ${unit}` : ''}`;

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showValueBadge) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <label
              htmlFor={sliderId}
              className="font-semibold uppercase tracking-wider text-slate-600 select-none"
            >
              {label}
            </label>
          )}
          {showValueBadge && (
            <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-xl border border-primary-200/70 shadow-2xs">
              {formattedDisplay}
            </span>
          )}
        </div>
      )}

      {/* Slider Track with Dynamic Progress Fill */}
      <div className="relative flex items-center w-full py-1.5 select-none">
        {/* Base Track */}
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Accessible Range Input Overlaid */}
        <input
          type="range"
          id={sliderId}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed',
            'focus-visible:outline-none'
          )}
          {...props}
        />

        {/* Custom Thumb Element */}
        <div
          className={cn(
            'absolute size-4.5 rounded-full bg-white border-2 border-primary-600 shadow-md pointer-events-none transition-transform duration-75',
            'transform -translate-x-1/2',
            disabled && 'border-slate-400 bg-slate-200'
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
