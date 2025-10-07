'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginContent() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  return (
    <>
      {registered && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Registration successful! Please sign in.
          </p>
        </div>
      )}

      <LoginForm />

      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link href="/register" className="text-primary hover:underline font-medium">
          Create one
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mujarrad</h1>
          <p className="text-gray-600">Knowledge Graph Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials to access your workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoginForm />}>
              <LoginContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
