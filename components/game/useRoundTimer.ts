"use client";

import { useEffect, useState } from "react";

type UseRoundTimerOptions = {
  totalSeconds: number;
  onTimeUp?: () => void;
};

export function useRoundTimer({ totalSeconds, onTimeUp }: UseRoundTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

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
    progress: totalSeconds > 0 ? secondsLeft / totalSeconds : 0,
    totalSeconds,
  };
}
