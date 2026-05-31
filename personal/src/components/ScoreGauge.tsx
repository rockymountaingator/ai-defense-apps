'use client';

import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  color: string;
  size?: number;
  delay?: number;
}

export default function ScoreGauge({ score, label, color, size = 140, delay = 400 }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Animate the number counting up
  useEffect(() => {
    if (!animated) return;
    const duration = 1200;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setDisplayScore(current);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [animated, score]);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animated ? (score / 100) * circumference : 0);

  return (
    <div className="flex flex-col items-center">
      {/* Gauge with overlaid number */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-sand)"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: animated ? 'stroke-dashoffset 1.2s ease-out' : 'none',
            }}
          />
        </svg>
        {/* Center number — positioned inside the relative wrapper */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-3xl font-bold text-ink"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {displayScore}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-soft-slate">{label}</p>
    </div>
  );
}
