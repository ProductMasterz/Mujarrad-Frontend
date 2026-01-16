'use client';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function EmptyState({
  title = 'No items to display',
  subtitle = 'Click the + button to add new items',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] text-center">
      <p className="text-[15px] font-normal text-[#828282] tracking-[-0.24px]">
        {title}
      </p>
      <p className="text-[13px] font-normal text-[#bdbdbd] mt-2 tracking-[-0.24px]">
        {subtitle}
      </p>
    </div>
  );
}
