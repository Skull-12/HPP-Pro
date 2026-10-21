import React, { useState, useEffect } from 'react';
import { formatRupiah } from '../utils/calculator';

interface CurrencyInputProps {
  id?: string;
  label?: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  helperText?: string;
  min?: number;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '0',
  helperText,
  min = 0,
  required = false,
  className = '',
  disabled = false,
}) => {
  // Local string representation for smooth editing
  const [displayValue, setDisplayValue] = useState<string>(
    value ? value.toLocaleString('id-ID') : ''
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value ? value.toLocaleString('id-ID') : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Keep only digits
    const cleaned = raw.replace(/[^0-9]/g, '');

    if (cleaned === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const num = parseInt(cleaned, 10);
    const validNum = Math.max(min, isNaN(num) ? 0 : num);
    
    // Format with thousands separator for Indonesian ID
    setDisplayValue(validNum.toLocaleString('id-ID'));
    onChange(validNum);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value || value <= 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(value.toLocaleString('id-ID'));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 tracking-wide"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-xs font-semibold text-slate-400">Rp</span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          id={id}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-500 tabular-nums transition-colors"
        />
      </div>

      {helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : value > 0 && isFocused ? (
        <p className="text-xs text-emerald-700 font-medium">
          {formatRupiah(value)}
        </p>
      ) : null}
    </div>
  );
};
