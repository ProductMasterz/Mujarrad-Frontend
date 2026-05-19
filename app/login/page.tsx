'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthCard } from '@/components/auth/AuthCard';

function LoginContent() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  return (
    <>
      {registered && (
        <div className="mb-[24px] p-[12px] bg-green-50 border border-green-200 rounded-[8px]">
          <p className="text-[13px] text-green-800 text-center tracking-[-0.08px]">
            Registration successful! Please sign in.
          </p>
        </div>
      )}
      <LoginForm />
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to your account">
      <Suspense fallback={<LoginForm />}>
        <LoginContent />
      </Suspense>
    </AuthCard>
  );
}