'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="mb-[20px]">
        <label className="font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={`w-full h-[48px] px-[16px] ${isPassword ? 'pr-[48px]' : ''} bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2] transition-colors ${className || ''}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#333] transition-colors"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-[8px] text-[13px] text-[#d4183d] tracking-[-0.08px]">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
