"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { FocusMarkerOnImage } from "@/components/focus/FocusMarkerOverlay";
import {
  REVEAL_LAYOUT_ID,
  REVEAL_MARKER_DELAY,
  REVEAL_NAME_DELAY,
  REVEAL_TRANSITION,
} from "@/lib/game/constants";
import type { RoundEntry } from "@/lib/types/tournament";

type RevealedPhaseProps = {
  round: RoundEntry;
};

export function RevealedPhase({ round }: RevealedPhaseProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [layoutSettled, setLayoutSettled] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex w-full max-w-3xl flex-col items-center"
    >
      <motion.div
        layoutId={REVEAL_LAYOUT_ID}
        transition={REVEAL_TRANSITION}
        onLayoutAnimationComplete={() => setLayoutSettled((n) => n + 1)}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60 ring-2 ring-gold/30"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- oryginał dopiero po kliknięciu */}
        <img
          ref={imgRef}
          src={round.originalPreviewUrl}
          alt="Ujawnione zdjęcie"
          className="block max-h-[70vh] w-full object-contain"
        />
        {round.focusMarker && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: REVEAL_MARKER_DELAY, duration: 0.5 }}
            className="pointer-events-none absolute inset-0"
          >
            <FocusMarkerOnImage
              marker={round.focusMarker}
              imageRef={imgRef}
              overlayRef={overlayRef}
              recalcToken={layoutSettled}
              animate
              pulse
            />
          </motion.div>
        )}
      </motion.div>

      {round.personName && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: REVEAL_NAME_DELAY, duration: 0.6 }}
          className="mt-8 font-display text-4xl tracking-wide text-gold sm:text-5xl"
        >
          {round.personName}
        </motion.p>
      )}
    </motion.div>
  );
}
