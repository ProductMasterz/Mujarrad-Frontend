'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterFormData } from '@/schemas';
import { useRegister } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/errors';

export function RegisterForm() {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="johndoe"
          {...register('username')}
          disabled={isPending}
        />
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          disabled={isPending}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
