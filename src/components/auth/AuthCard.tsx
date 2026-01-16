'use client';

import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[440px] p-[40px]">
        <div className="text-center mb-[32px]">
          <h1 className="font-bold text-[28px] text-[#333] tracking-[0.42px] mb-[8px]">
            {title}
          </h1>
          <p className="font-normal text-[13px] text-[#828282] tracking-[-0.08px]">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
