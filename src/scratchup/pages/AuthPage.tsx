import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

type AuthPageProps = {
  onLogin: (email: string, password: string) => void;
};

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (showForgotPassword) {
      // Handle forgot password
      alert(`Password reset link sent to ${email}`);
      setShowForgotPassword(false);
      return;
    }

    if (isSignUp) {
      // Handle sign up - show verification
      if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      setShowVerification(true);
    } else {
      // Handle login
      onLogin(email, password);
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length === 6) {
      alert("Email verified successfully!");
      onLogin(email, password);
    } else {
      alert("Please enter the complete verification code");
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  // Verification screen
  if (showVerification) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[440px] p-[40px]">
          <div className="text-center mb-[32px]">
            <h1
              className="font-['Roboto:Bold',sans-serif] font-bold text-[28px] tracking-[0.42px] mb-[8px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Verify Your Email
            </h1>
            <p
              className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              We sent a verification code to
            </p>
            <p
              className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {email}
            </p>
          </div>

          <form onSubmit={handleVerificationSubmit}>
            <div className="flex gap-[12px] justify-center mb-[24px]">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                  className="size-[48px] text-center bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[20px] text-[#333] focus:outline-none focus:border-[#248bf2]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full h-[48px] bg-[#248bf2] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[15px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors mb-[16px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Verify Email
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => alert("Verification code resent!")}
                className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#248bf2] tracking-[-0.08px] hover:underline"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Resend code
              </button>
            </div>
          </form>

          <button
            onClick={() => {
              setShowVerification(false);
              setVerificationCode(["", "", "", "", "", ""]);
            }}
            className="mt-[24px] w-full font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] hover:text-[#333]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            ← Back to sign up
          </button>
        </div>
      </div>
    );
  }

  // Forgot password screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[440px] p-[40px]">
          <div className="text-center mb-[32px]">
            <h1
              className="font-['Roboto:Bold',sans-serif] font-bold text-[28px] tracking-[0.42px] mb-[8px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Reset Password
            </h1>
            <p
              className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Enter your email and we&apos;ll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-[24px]">
              <label
                className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full h-[48px] px-[16px] bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              />
            </div>

            <button
              type="submit"
              className="w-full h-[48px] bg-[#248bf2] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[15px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors mb-[16px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Send Reset Link
            </button>
          </form>

          <button
            onClick={() => setShowForgotPassword(false)}
            className="w-full font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] hover:text-[#333]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  // Login / Sign Up screen
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[440px] p-[40px]">
        <div className="text-center mb-[32px]">
          <h1
            className="font-['Roboto:Bold',sans-serif] font-bold text-[28px] tracking-[0.42px] mb-[8px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {isSignUp ? "Sign up to get started" : "Sign in to your account"}
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="flex gap-[12px] mb-[24px]">
          <button
            type="button"
            onClick={() => alert("Google sign in coming soon!")}
            className="flex-1 h-[48px] bg-white border border-[#e0e0e0] rounded-[8px] font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] hover:bg-[#f5f5f5] transition-colors flex items-center justify-center gap-[8px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => alert("Apple sign in coming soon!")}
            className="flex-1 h-[48px] bg-black border border-black rounded-[8px] font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.08px] hover:bg-[#333] transition-colors flex items-center justify-center gap-[8px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </button>
        </div>

        {/* SAML SSO */}
        <button
          type="button"
          onClick={() => alert("SAML SSO coming soon!")}
          className="w-full h-[48px] bg-white border border-[#e0e0e0] rounded-[8px] font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] hover:bg-[#f5f5f5] transition-colors mb-[24px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Sign in with SAML SSO
        </button>

        {/* Divider */}
        <div className="flex items-center gap-[16px] mb-[24px]">
          <div className="flex-1 h-[1px] bg-[#e0e0e0]" />
          <span
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            or
          </span>
          <div className="flex-1 h-[1px] bg-[#e0e0e0]" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="mb-[20px]">
              <label
                className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required={isSignUp}
                className="w-full h-[48px] px-[16px] bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              />
            </div>
          )}

          <div className="mb-[20px]">
            <label
              className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full h-[48px] px-[16px] bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />
          </div>

          <div className="mb-[20px]">
            <label
              className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-[48px] px-[16px] pr-[48px] bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#333]"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="mb-[20px]">
              <label
                className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={isSignUp}
                  className="w-full h-[48px] px-[16px] pr-[48px] bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#333]"
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>
          )}

          {!isSignUp && (
            <div className="flex justify-end mb-[24px]">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#248bf2] tracking-[-0.08px] hover:underline"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-[48px] bg-[#248bf2] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[15px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors mb-[16px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>

          <div className="text-center">
            <span
              className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword("");
                setConfirmPassword("");
                setFullName("");
              }}
              className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#248bf2] tracking-[-0.08px] hover:underline"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
