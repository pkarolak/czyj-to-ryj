"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { TriviaRound } from "@/lib/types/tournament";

const LABELS = ["A", "B", "C", "D"];

type TriviaQuestionPhaseProps = {
  round: TriviaRound;
  onReveal: () => void;
};

export function TriviaQuestionPhase({ round, onReveal }: TriviaQuestionPhaseProps) {
  const options = round.type === "closed" ? (round.options ?? []) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-2xl flex-col items-center gap-6"
    >
      <h2 className="text-center font-display text-3xl leading-snug text-cream sm:text-4xl">
        {round.question}
      </h2>

      {round.imagePreviewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={round.imagePreviewUrl}
          alt=""
          className="max-h-[40vh] w-full rounded-2xl object-contain ring-1 ring-white/10"
        />
      )}

      {round.type === "closed" && (
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {options.map((option, i) => (
            <div
              key={`${LABELS[i]}-${option}`}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-cream"
            >
              <span className="mr-2 font-display text-gold">{LABELS[i]}.</span>
              {option}
            </div>
          ))}
        </div>
      )}

      <Button variant="secondary" onClick={onReveal} className="mt-4">
        Pokaż odpowiedź
      </Button>
    </motion.div>
  );
}
