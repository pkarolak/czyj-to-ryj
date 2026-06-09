"use client";

import { motion } from "framer-motion";
import { Music2, Volume2 } from "lucide-react";
import { useState } from "react";
import { GameCountdown } from "@/components/game/GameCountdown";
import { useRoundTimer } from "@/components/game/useRoundTimer";
import { Button } from "@/components/ui/Button";
import { playSequence } from "@/lib/audio/pianoPlayer";
import type { HarmonyRound } from "@/lib/types/tournament";

type HarmonyPlayingPhaseProps = {
  round: HarmonyRound;
  timerSeconds: number;
  onReveal: () => void;
  onTimeUp: () => void;
};

export function HarmonyPlayingPhase({
  round,
  timerSeconds,
  onReveal,
  onTimeUp,
}: HarmonyPlayingPhaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { secondsLeft, progress } = useRoundTimer({
    totalSeconds: timerSeconds,
    onTimeUp,
  });

  const handlePlay = async () => {
    setIsPlaying(true);
    try {
      await playSequence(round.notes);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-2xl flex-col items-center gap-8"
    >
      <GameCountdown
        secondsLeft={secondsLeft}
        progress={progress}
        size={140}
      />

      <motion.div
        animate={{ scale: isPlaying ? [1, 1.08, 1] : [1, 1.03, 1] }}
        transition={{ repeat: Infinity, duration: isPlaying ? 0.6 : 2 }}
        className="flex h-36 w-36 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold"
      >
        <Music2 className="h-20 w-20" />
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2">
        {round.notes.map((note, i) => (
          <span
            key={`${note}-${i}`}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-base text-cream/60"
          >
            {note}
          </span>
        ))}
      </div>

      <Button
        size="lg"
        onClick={() => void handlePlay()}
        disabled={isPlaying}
        className="px-10 text-lg"
      >
        <Volume2 className="h-5 w-5" />
        {isPlaying ? "Odtwarzanie…" : "Odtwórz dźwięki"}
      </Button>

      <Button variant="secondary" size="lg" onClick={onReveal}>
        Pokaż odpowiedź
      </Button>
    </motion.div>
  );
}
