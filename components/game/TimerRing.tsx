"use client";

import { ROUND_SECONDS } from "@/lib/game/constants";

type TimerRingProps = {
  progress: number;
  size: number;
};

export function TimerRing({ progress, size }: TimerRingProps) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 -rotate-90"
      aria-hidden
    >
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
  );
}

type TimerCountdownProps = {
  secondsLeft: number;
};

export function TimerCountdown({ secondsLeft }: TimerCountdownProps) {
  return (
    <p className="mt-4 font-display text-3xl tabular-nums text-gold">
      {String(secondsLeft).padStart(2, "0")}
    </p>
  );
}

export function TimerRingLabel() {
  return (
    <p className="mt-1 text-center text-xs text-cream/40">
      {ROUND_SECONDS} sekund na zgadywanie
    </p>
  );
}
