"use client";

import { motion } from "framer-motion";
import { TimerRing, TimerRingLabel } from "@/components/game/TimerRing";
import { useRoundTimer } from "@/components/game/useRoundTimer";
import { REVEAL_LAYOUT_ID } from "@/lib/game/constants";

type GuessingPhaseProps = {
  croppedPreviewUrl: string;
  onReveal: () => void;
  onTimeUp: () => void;
};

export function GuessingPhase({
  croppedPreviewUrl,
  onReveal,
  onTimeUp,
}: GuessingPhaseProps) {
  const { secondsLeft, progress } = useRoundTimer({ onTimeUp });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex w-full max-w-3xl flex-col items-center"
    >
      <div className="relative flex items-center justify-center">
        <TimerRing progress={progress} secondsLeft={secondsLeft} />
        <motion.button
          type="button"
          layoutId={REVEAL_LAYOUT_ID}
          onClick={onReveal}
          className="relative z-10 h-56 w-56 cursor-pointer overflow-hidden rounded-full ring-2 ring-gold/40 transition-shadow hover:ring-gold sm:h-64 sm:w-64"
          aria-label="Ujawnij zdjęcie"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- anti-spoiler: tylko detal w DOM */}
          <img
            src={croppedPreviewUrl}
            alt="Detal do zgadnięcia"
            className="h-full w-full object-cover"
          />
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 text-sm text-cream/40"
      >
        Kliknij w detal, aby ujawnić zdjęcie
      </motion.p>
      <TimerRingLabel />
    </motion.div>
  );
}
