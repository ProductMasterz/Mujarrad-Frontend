'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mujarrad</h1>
          <p className="text-gray-600">Knowledge Graph Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your information to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
