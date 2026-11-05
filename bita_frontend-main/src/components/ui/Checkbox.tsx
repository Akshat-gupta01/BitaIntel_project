import React, { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, disabled, checked, onChange, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className={cn('flex flex-col', className)}>
        <label
          htmlFor={checkboxId}
          className={cn(
            'group inline-flex items-start gap-2.5 cursor-pointer select-none',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              disabled={disabled}
              checked={checked}
              onChange={onChange}
              className="peer sr-only"
              {...props}
            />
            {/* Custom Checkbox Frame */}
            <div
              className={cn(
                'w-4.5 h-4.5 rounded-[5px] border border-slate-300 bg-white shadow-2xs transition-all duration-150 ease-in-out',
                'flex items-center justify-center shrink-0',
                'peer-focus-visible:ring-3 peer-focus-visible:ring-primary-500/25 peer-focus-visible:border-primary-500',
                'peer-checked:bg-primary-600 peer-checked:border-primary-600 peer-checked:text-white',
                'peer-hover:not-disabled:border-primary-500 peer-hover:not-disabled:bg-slate-50 peer-checked:peer-hover:not-disabled:bg-primary-700',
                error && 'border-rose-500 peer-focus-visible:ring-rose-500/20'
              )}
            >
              <Check
                className={cn(
                  'w-3 h-3 text-white stroke-[3.2] transition-transform duration-150 shrink-0 pointer-events-none',
                  checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                )}
              />
            </div>
          </div>

          {(label || description) && (
            <div className="text-xs leading-tight space-y-0.5">
              {label && (
                <span className="font-semibold text-slate-800 group-hover:text-slate-900">
                  {label}
                </span>
              )}
              {description && (
                <p className="text-[11px] text-slate-500 font-normal leading-normal">
                  {description}
                </p>
              )}
            </div>
          )}
        </label>
        {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
