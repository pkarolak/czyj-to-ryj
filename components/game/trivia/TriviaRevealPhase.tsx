"use client";

import { motion } from "framer-motion";
import type { TriviaRound } from "@/lib/types/tournament";

const LABELS = ["A", "B", "C", "D"];

type TriviaRevealPhaseProps = {
  round: TriviaRound;
};

export function TriviaRevealPhase({ round }: TriviaRevealPhaseProps) {
  if (round.type === "open") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-2xl flex-col items-center gap-4 text-center"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-gold/60">
          Poprawna odpowiedź
        </p>
        <h2 className="font-display text-4xl text-gold sm:text-5xl">
          {round.correctAnswer}
        </h2>
      </motion.div>
    );
  }

  const options = round.options ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid w-full max-w-2xl gap-3 sm:grid-cols-2"
    >
      {options.map((option, i) => {
        const isCorrect = option === round.correctAnswer;
        return (
          <div
            key={`${LABELS[i]}-${option}`}
            className={`rounded-xl border px-4 py-4 transition-colors ${
              isCorrect
                ? "border-gold bg-gold/15 text-cream"
                : "border-white/10 bg-white/[0.03] text-cream/50"
            }`}
          >
            <span className="mr-2 font-display text-gold">{LABELS[i]}.</span>
            {option}
          </div>
        );
      })}
    </motion.div>
  );
}
