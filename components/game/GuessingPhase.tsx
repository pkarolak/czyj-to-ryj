"use client";

import { motion } from "framer-motion";
import { TimerCountdown, TimerRing } from "@/components/game/TimerRing";
import { useRoundTimer } from "@/components/game/useRoundTimer";
import { REVEAL_LAYOUT_ID, REVEAL_TRANSITION } from "@/lib/game/constants";

const PHOTO_SIZE = 240;
const RING_PADDING = 20;
const RING_SIZE = PHOTO_SIZE + RING_PADDING * 2;

type GuessingPhaseProps = {
  croppedPreviewUrl: string;
  timerSeconds: number;
  onReveal: () => void;
  onTimeUp: () => void;
};

export function GuessingPhase({
  croppedPreviewUrl,
  timerSeconds,
  onReveal,
  onTimeUp,
}: GuessingPhaseProps) {
  const { secondsLeft, progress } = useRoundTimer({
    totalSeconds: timerSeconds,
    onTimeUp,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex w-full max-w-3xl flex-col items-center"
    >
      <h2 className="mb-6 font-display text-5xl text-gold sm:text-6xl">
        Czyj to ryj?
      </h2>

      <div
        className="relative shrink-0"
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        <TimerRing progress={progress} size={RING_SIZE} />
        <motion.button
          type="button"
          layoutId={REVEAL_LAYOUT_ID}
          transition={REVEAL_TRANSITION}
          onClick={onReveal}
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer overflow-hidden rounded-full ring-2 ring-gold/40 transition-shadow hover:ring-gold"
          style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
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

      <TimerCountdown secondsLeft={secondsLeft} />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 text-sm text-cream/40"
      >
        Kliknij w detal, aby ujawnić zdjęcie
      </motion.p>
    </motion.div>
  );
}
