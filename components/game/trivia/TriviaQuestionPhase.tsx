"use client";

import { motion } from "framer-motion";
import { GameCountdown } from "@/components/game/GameCountdown";
import { useRoundTimer } from "@/components/game/useRoundTimer";
import { Button } from "@/components/ui/Button";
import type { TriviaRound } from "@/lib/types/tournament";

const LABELS = ["A", "B", "C", "D"];

type TriviaQuestionPhaseProps = {
  round: TriviaRound;
  timerSeconds: number;
  onReveal: () => void;
  onTimeUp: () => void;
};

export function TriviaQuestionPhase({
  round,
  timerSeconds,
  onReveal,
  onTimeUp,
}: TriviaQuestionPhaseProps) {
  const options = round.type === "closed" ? (round.options ?? []) : [];
  const { secondsLeft, progress } = useRoundTimer({
    totalSeconds: timerSeconds,
    onTimeUp,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-4xl flex-col items-center gap-8"
    >
      <GameCountdown
        secondsLeft={secondsLeft}
        progress={progress}
        size={140}
      />

      <h2 className="text-center font-display text-4xl leading-snug text-cream sm:text-5xl lg:text-6xl">
        {round.question}
      </h2>

      {round.imagePreviewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={round.imagePreviewUrl}
          alt=""
          className="max-h-[35vh] w-full rounded-2xl object-contain ring-1 ring-white/10"
        />
      )}

      {round.type === "closed" && (
        <div className="grid w-full gap-4 sm:grid-cols-2">
          {options.map((option, i) => (
            <div
              key={`${LABELS[i]}-${option}`}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-5 text-xl text-cream sm:text-2xl"
            >
              <span className="mr-3 font-display text-2xl text-gold sm:text-3xl">
                {LABELS[i]}.
              </span>
              {option}
            </div>
          ))}
        </div>
      )}

      <Button variant="secondary" size="lg" onClick={onReveal} className="mt-2">
        Pokaż odpowiedź
      </Button>
    </motion.div>
  );
}
