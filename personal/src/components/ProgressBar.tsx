'use client';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = ((current) / total) * 100;

  return (
    <div className="px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Dot indicators */}
        <div className="flex items-center justify-between gap-1">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < current
                  ? 'bg-terra'
                  : i === current
                    ? 'bg-terra/40'
                    : 'bg-sand'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
