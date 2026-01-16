'use client';

interface HomeIconProps {
  className?: string;
}

export function HomeIcon({ className = 'size-[18px]' }: HomeIconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none">
      <path
        d="M7.04998 2.98498L2.32498 6.85498C1.79998 7.27498 1.37498 8.18998 1.37498 8.87998V13.78C1.37498 15.18 2.51998 16.33 3.91998 16.33H14.08C15.48 16.33 16.625 15.18 16.625 13.785V8.99998C16.625 8.23498 16.14 7.26748 15.545 6.86248L10.12 2.87248C9.26998 2.26498 7.86748 2.29498 7.04998 2.98498Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9 13.4999V10.9999"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
