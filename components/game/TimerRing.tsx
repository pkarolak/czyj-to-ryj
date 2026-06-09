"use client";

import { ROUND_SECONDS } from "@/lib/game/constants";

type TimerRingProps = {
  progress: number;
  secondsLeft: number;
  size?: number;
};

export function TimerRing({
  progress,
  secondsLeft,
  size = 280,
}: TimerRingProps) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f5c542"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute font-display text-2xl tabular-nums text-gold">
        {String(secondsLeft).padStart(2, "0")}
      </span>
    </div>
  );
}

export function TimerRingLabel() {
  return (
    <p className="mt-2 text-center text-xs text-cream/40">
      {ROUND_SECONDS} sekund na zgadywanie
    </p>
  );
}
