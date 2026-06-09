"use client";

import { useEffect, useState } from "react";
import { ROUND_SECONDS } from "@/lib/game/constants";

type UseRoundTimerOptions = {
  onTimeUp?: () => void;
};

export function useRoundTimer({ onTimeUp }: UseRoundTimerOptions = {}) {
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [onTimeUp]);

  return {
    secondsLeft,
    progress: secondsLeft / ROUND_SECONDS,
  };
}
