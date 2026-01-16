'use client';

import { ReactNode } from 'react';

interface CardGridProps {
  children: ReactNode;
}

export function CardGrid({ children }: CardGridProps) {
  return (
    <div className="flex gap-[19px] flex-wrap pt-[15px]">
      {children}
    </div>
  );
}
