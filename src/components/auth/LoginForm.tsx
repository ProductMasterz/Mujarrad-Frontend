'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginFormData } from '@/schemas';
import { useLogin } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/errors';
import { getRedirectAfterLogin, clearRedirectAfterLogin } from '@/services/api/client';

export function LoginForm() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

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
        router.push(redirectPath || '/workspaces');
      },
      onError: (error) => {
        if (isApiError(error)) {
          if (error.isValidationError()) {
            setError('root', { message: error.getUserMessage() });
          } else {
            setError('root', { message: error.getUserMessage() });
          }
        } else {
          setError('root', { message: 'Login failed. Please try again.' });
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          disabled={isPending}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isPending}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
