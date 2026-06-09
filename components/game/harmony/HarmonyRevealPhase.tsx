"use client";

import { motion } from "framer-motion";
import type { HarmonyRound } from "@/lib/types/tournament";

type HarmonyRevealPhaseProps = {
  round: HarmonyRound;
};

export function HarmonyRevealPhase({ round }: HarmonyRevealPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex w-full max-w-2xl flex-col items-center gap-6 text-center"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-gold/60">
        To był utwór
      </p>
      <h2 className="font-display text-5xl text-gold sm:text-6xl">
        {round.songTitle}
      </h2>
    </motion.div>
  );
}
