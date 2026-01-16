'use client';

import { GoogleLoginButton } from './GoogleLoginButton';

interface SocialLoginButtonsProps {
  onGoogleError?: (error: string) => void;
  onGoogleSuccess?: (isNewUser: boolean) => void;
}

export function SocialLoginButtons({ onGoogleError, onGoogleSuccess }: SocialLoginButtonsProps) {
  return (
    <>
      {/* Google Sign-In */}
      <div className="mb-[12px]">
        <GoogleLoginButton onError={onGoogleError} onSuccess={onGoogleSuccess} />
      </div>

      {/* SAML SSO */}
      <button
        type="button"
        onClick={() => alert('SAML SSO coming soon!')}
        className="w-full h-[48px] bg-white border border-[#e0e0e0] rounded-[8px] font-medium text-[13px] text-[#333] tracking-[-0.08px] hover:bg-[#f5f5f5] transition-colors mb-[24px]"
      >
        Sign in with SAML SSO
      </button>

      {/* Divider */}
      <div className="flex items-center gap-[16px] mb-[24px]">
        <div className="flex-1 h-[1px] bg-[#e0e0e0]" />
        <span className="font-normal text-[13px] text-[#828282] tracking-[-0.08px]">
          or
        </span>
        <div className="flex-1 h-[1px] bg-[#e0e0e0]" />
      </div>
    </>
  );
}
