'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  className?: string;
  disabled?: boolean;
  options?: SelectOption[];
  children?: React.ReactNode;
}

export function Select({
  label,
  error,
  hint,
  name,
  id,
  placeholder = 'Select an option...',
  value,
  defaultValue,
  onChange,
  className,
  disabled = false,
  options: propsOptions,
  children,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  // Extract options from props or children if <option> elements are passed
  const options: SelectOption[] = React.useMemo(() => {
    if (propsOptions && propsOptions.length > 0) {
      return propsOptions;
    }
    const opts: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<{ value?: string | number; disabled?: boolean; children?: React.ReactNode }>(child)) {
        const val = String(child.props.value ?? '');
        const lbl = typeof child.props.children === 'string' || typeof child.props.children === 'number'
          ? String(child.props.children)
          : val;
        opts.push({
          value: val,
          label: lbl || val,
          disabled: Boolean(child.props.disabled),
        });
      }
    });
    return opts;
  }, [propsOptions, children]);

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined ? defaultValue : options[0]?.value || ''
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((opt) => opt.value === currentValue) || {
    value: currentValue,
    label: currentValue || placeholder,
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    onChange?.({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
        >
          {label}
        </label>
      )}

      {/* Hidden input for form submits */}
      <input type="hidden" name={name} value={currentValue} id={selectId} />

      {/* Custom interactive dropdown button */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between min-h-11 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 shadow-2xs outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-500/10',
          disabled && 'cursor-not-allowed opacity-50 bg-slate-50',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
        )}
      >
        <span className="truncate text-left font-semibold text-slate-900">
          {selectedOption.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'size-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2',
            isOpen && 'rotate-180 text-primary-600'
          )}
        />
      </button>

      {/* Custom floating list */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 top-full z-50 mt-1.5 w-full max-h-60 overflow-y-auto custom-scrollbar rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {options.map((opt) => {
            const isSelected = opt.value === currentValue;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm text-left transition-colors',
                  isSelected
                    ? 'bg-primary-50 text-primary-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  opt.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="size-4 text-primary-600 shrink-0 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
