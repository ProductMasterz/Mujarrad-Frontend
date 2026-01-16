'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginFormData } from '@/schemas';
import { useLogin } from '@/hooks/api';
import { isApiError } from '@/lib/errors';
import { getRedirectAfterLogin, clearRedirectAfterLogin } from '@/services/api/client';
import { SocialLoginButtons } from './SocialLoginButtons';
import { AuthInput } from './AuthInput';

export function LoginForm() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const [socialError, setSocialError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        const redirectPath = getRedirectAfterLogin();
        clearRedirectAfterLogin();
        router.push(redirectPath || '/spaces');
      },
      onError: (error) => {
        if (isApiError(error)) {
          setError('root', { message: error.getUserMessage() });
        } else {
          setError('root', { message: 'Login failed. Please try again.' });
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

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
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

        {/* Forgot Password Link */}
        <div className="flex justify-end mb-[24px]">
          <Link
            href="/forgot-password"
            className="font-normal text-[13px] text-[#248bf2] tracking-[-0.08px] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

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
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center">
          <span className="font-normal text-[13px] text-[#828282] tracking-[-0.08px]">
            Don&apos;t have an account?{' '}
          </span>
          <Link
            href="/register"
            className="font-medium text-[13px] text-[#248bf2] tracking-[-0.08px] hover:underline"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
