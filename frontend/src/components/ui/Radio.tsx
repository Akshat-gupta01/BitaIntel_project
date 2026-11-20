import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: RadioOption[];
  className?: string;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  error?: string;
  children?: React.ReactNode;
}

interface RadioContextType {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RadioContext = React.createContext<RadioContextType | null>(null);

export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  options,
  className,
  disabled,
  orientation = 'vertical',
  error,
  children,
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name || generatedName;

  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (val: string) => {
    if (value === undefined) setInternalValue(val);
    onChange?.(val);
  };

  return (
    <RadioContext.Provider
      value={{ name: groupName, value: currentValue, onChange: handleChange, disabled }}
    >
      <div
        role="radiogroup"
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          className
        )}
      >
        {options
          ? options.map((opt) => (
              <RadioItem
                key={opt.value}
                value={opt.value}
                label={opt.label}
                description={opt.description}
                disabled={disabled || opt.disabled}
              />
            ))
          : children}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </RadioContext.Provider>
  );
}

export interface RadioItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const RadioItem = React.forwardRef<HTMLInputElement, RadioItemProps>(
  ({ value, label, description, className, disabled: itemDisabled, id, ...props }, ref) => {
    const context = React.useContext(RadioContext);
    const generatedId = useId();
    const itemId = id || generatedId;

    const isChecked = context ? context.value === value : props.checked;
    const isDisabled = (context?.disabled || itemDisabled);

    const handleSelect = () => {
      if (!isDisabled && context) {
        context.onChange(value);
      }
    };

    return (
      <label
        htmlFor={itemId}
        onClick={handleSelect}
        className={cn(
          'group inline-flex items-start gap-2.5 cursor-pointer select-none',
          isDisabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            type="radio"
            id={itemId}
            ref={ref}
            name={context?.name || props.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => handleSelect()}
            className="peer sr-only"
            {...props}
          />
          {/* Custom Radio Outer Circle */}
          <div
            className={cn(
              'size-4.5 rounded-full border border-slate-300 bg-white shadow-2xs transition-all duration-200 ease-in-out flex items-center justify-center',
              'peer-focus-visible:ring-3 peer-focus-visible:ring-primary-500/25 peer-focus-visible:border-primary-500',
              'group-hover:not-disabled:border-primary-500 group-hover:not-disabled:bg-slate-50',
              isChecked && 'border-primary-600 bg-white'
            )}
          >
            {/* Inner Pill Dot */}
            <div
              className={cn(
                'size-2.5 rounded-full bg-primary-600 transition-transform duration-150',
                isChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
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
    );
  }
);

RadioItem.displayName = 'RadioItem';
