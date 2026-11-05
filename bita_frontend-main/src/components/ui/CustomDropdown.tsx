'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomDropdownProps {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: (DropdownOption | string)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  id?: string;
}

export function CustomDropdown({
  label,
  error,
  hint,
  placeholder = 'Select an option...',
  options,
  value,
  defaultValue,
  onChange,
  disabled = false,
  className,
  buttonClassName,
  menuClassName,
  id,
}: CustomDropdownProps) {
  const generatedId = useId();
  const dropdownId = id || generatedId;

  // Normalize options array
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined ? defaultValue : ''
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const selectedOption = normalizedOptions.find((opt) => opt.value === currentValue);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    if (value === undefined) {
      setInternalValue(option.value);
    }
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative w-full', className)} ref={dropdownRef}>
      {label && (
        <label
          id={`${dropdownId}-label`}
          htmlFor={`${dropdownId}-trigger`}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
        >
          {label}
        </label>
      )}

      <button
        id={`${dropdownId}-trigger`}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${dropdownId}-label ${dropdownId}-trigger` : undefined}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center justify-between min-h-11 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 shadow-2xs outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-500/10',
          disabled && 'cursor-not-allowed opacity-50 bg-slate-50',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
          buttonClassName
        )}
      >
        <span className="flex items-center gap-2 truncate text-left">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={selectedOption ? 'text-slate-900 font-semibold' : 'text-slate-400 font-normal'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'size-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2',
            isOpen && 'rotate-180 text-primary-600'
          )}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            'absolute left-0 top-full z-50 mt-1.5 w-full max-h-60 overflow-y-auto custom-scrollbar rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150',
            menuClassName
          )}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === currentValue;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt)}
                className={cn(
                  'w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm text-left transition-colors',
                  isSelected
                    ? 'bg-primary-50 text-primary-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  opt.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div>
                    <p className="truncate font-medium">{opt.label}</p>
                    {opt.description && (
                      <p className="text-[11px] text-slate-400 font-normal truncate">
                        {opt.description}
                      </p>
                    )}
                  </div>
                </div>

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
