"use client";

import { motion } from "framer-motion";
import {
  isTimerUrgent,
  TIMER_URGENT_THRESHOLD,
  TimerRing,
} from "@/components/game/TimerRing";

type GameCountdownProps = {
  secondsLeft: number;
  progress: number;
  size?: number;
  urgentBelow?: number;
};

export function GameCountdown({
  secondsLeft,
  progress,
  size = 120,
  urgentBelow = TIMER_URGENT_THRESHOLD,
}: GameCountdownProps) {
  const isUrgent = isTimerUrgent(secondsLeft, urgentBelow);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <TimerRing progress={progress} size={size} urgent={isUrgent} />
      <motion.p
        animate={isUrgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ repeat: isUrgent ? Infinity : 0, duration: 0.5 }}
        className={`absolute inset-0 flex items-center justify-center font-display tabular-nums ${
          isUrgent ? "text-red-400" : "text-gold"
        } ${size >= 140 ? "text-6xl" : "text-5xl"}`}
      >
        {String(secondsLeft).padStart(2, "0")}
      </motion.p>
    </div>
  );
}
