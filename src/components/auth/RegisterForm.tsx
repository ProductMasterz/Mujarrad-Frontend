'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, type RegisterFormData } from '@/schemas';
import { useRegister } from '@/hooks/api';
import { isApiError } from '@/lib/errors';
import { SocialLoginButtons } from './SocialLoginButtons';
import { AuthInput } from './AuthInput';

export function RegisterForm() {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();
  const [socialError, setSocialError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;

    registerUser(registerData, {
      onSuccess: () => {
        router.push('/login?registered=true');
      },
      onError: (error) => {
        if (isApiError(error)) {
          if (error.isValidationError() && error.problemDetail) {
            const problemDetail = error.problemDetail as { errors?: Array<{ field: string; message: string }> };
            if (problemDetail.errors && Array.isArray(problemDetail.errors)) {
              problemDetail.errors.forEach((err) => {
                setError(err.field as keyof RegisterFormData, { message: err.message });
              });
            } else {
              setError('root', { message: error.getUserMessage() });
            }
          } else {
            setError('root', { message: error.getUserMessage() });
          }
        } else {
          setError('root', { message: 'Registration failed. Please try again.' });
        }
      },
    });
  };

  return (
    <div>
      {/* Social Login */}
      <SocialLoginButtons
        onGoogleError={(error) => setSocialError(error)}
        onGoogleSuccess={() => setSocialError(null)}
      />
      {socialError && (
        <p className="mb-[16px] text-[13px] text-[#d4183d] text-center tracking-[-0.08px]">
          {socialError}
        </p>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AuthInput
          label="Username"
          type="text"
          placeholder="johndoe"
          disabled={isPending}
          error={errors.username?.message}
          {...register('username')}
        />

        <AuthInput
          label="Email"
          type="email"
          placeholder="your@email.com"
          disabled={isPending}
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          error={errors.password?.message}
          {...register('password')}
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {errors.root && (
          <p className="mb-[16px] text-[13px] text-[#d4183d] text-center tracking-[-0.08px]">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-[48px] bg-[#248bf2] rounded-[100px] font-semibold text-[15px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors mb-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="text-center">
          <span className="font-normal text-[13px] text-[#828282] tracking-[-0.08px]">
            Already have an account?{' '}
          </span>
          <Link
            href="/login"
            className="font-medium text-[13px] text-[#248bf2] tracking-[-0.08px] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
