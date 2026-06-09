"use client";

import { motion } from "framer-motion";

export const TIMER_URGENT_THRESHOLD = 5;

export function isTimerUrgent(
  secondsLeft: number,
  urgentBelow = TIMER_URGENT_THRESHOLD,
): boolean {
  return secondsLeft <= urgentBelow;
}

type TimerRingProps = {
  progress: number;
  size: number;
  urgent?: boolean;
};

export function TimerRing({ progress, size, urgent = false }: TimerRingProps) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const ringColor = urgent ? "#f87171" : "#f5c542";

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
        stroke={ringColor}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke,stroke-dashoffset] duration-300 ease-linear"
      />
    </svg>
  );
}

type TimerCountdownProps = {
  secondsLeft: number;
  urgentBelow?: number;
};

export function TimerCountdown({
  secondsLeft,
  urgentBelow = TIMER_URGENT_THRESHOLD,
}: TimerCountdownProps) {
  const isUrgent = isTimerUrgent(secondsLeft, urgentBelow);

  return (
    <motion.p
      animate={isUrgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ repeat: isUrgent ? Infinity : 0, duration: 0.5 }}
      className={`mt-4 font-display text-5xl tabular-nums sm:text-6xl ${
        isUrgent ? "text-red-400" : "text-gold"
      }`}
    >
      {String(secondsLeft).padStart(2, "0")}
    </motion.p>
  );
}
