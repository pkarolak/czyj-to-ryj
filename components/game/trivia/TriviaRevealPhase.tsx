"use client";

import { motion } from "framer-motion";
import type { TriviaRound } from "@/lib/types/tournament";

const LABELS = ["A", "B", "C", "D"];

type TriviaRevealPhaseProps = {
  round: TriviaRound;
};

export function TriviaRevealPhase({ round }: TriviaRevealPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-4xl flex-col items-center gap-8"
    >
      <h2 className="text-center font-display text-3xl leading-snug text-cream/70 sm:text-4xl lg:text-5xl">
        {round.question}
      </h2>

      {round.imagePreviewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={round.imagePreviewUrl}
          alt=""
          className="max-h-[28vh] w-full rounded-2xl object-contain opacity-80 ring-1 ring-white/10"
        />
      )}

      {round.type === "open" ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/60">
            Poprawna odpowiedź
          </p>
          <h3 className="font-display text-5xl text-gold sm:text-6xl lg:text-7xl">
            {round.correctAnswer}
          </h3>
        </div>
      ) : (
        <div className="grid w-full gap-4 sm:grid-cols-2">
          {(round.options ?? []).map((option, i) => {
            const isCorrect = option === round.correctAnswer;
            return (
              <div
                key={`${LABELS[i]}-${option}`}
                className={`rounded-xl border px-6 py-5 text-xl sm:text-2xl ${
                  isCorrect
                    ? "border-gold bg-gold/15 text-cream"
                    : "border-white/10 bg-white/[0.03] text-cream/40"
                }`}
              >
                <span className="mr-3 font-display text-2xl text-gold sm:text-3xl">
                  {LABELS[i]}.
                </span>
                {option}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
