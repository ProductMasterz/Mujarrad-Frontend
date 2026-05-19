'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/services/api/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { getRedirectAfterLogin, clearRedirectAfterLogin } from '@/services/api/client';

interface GoogleLoginButtonProps {
  onSuccess?: (isNewUser: boolean) => void;
  onError?: (error: string) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      onError?.('No credential received from Google');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.loginWithGoogle(response.credential);

      // Update auth store (setUser also sets isAuthenticated)
      setUser(data.user);

      // Handle redirect
      const redirectPath = getRedirectAfterLogin();
      clearRedirectAfterLogin();

      onSuccess?.(data.isNewUser);

      router.push(redirectPath || '/spaces');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    onError?.('Google sign-in was cancelled or failed');
  };

  if (isLoading) {
    return (
      <div className="flex h-[40px] w-full items-center justify-center rounded-md border bg-muted">
        <span className="text-sm text-muted-foreground">Signing in...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
}
