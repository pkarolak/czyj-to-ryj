"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Confetti } from "@/components/game/Confetti";
import { LeaderboardDisplay } from "@/components/scores/LeaderboardDisplay";
import { Button } from "@/components/ui/Button";
import { sortTeamsByScore, type Team } from "@/lib/types/scoreRoom";

type FinalCelebrationProps = {
  teams: Record<string, Team>;
  roundCount: number;
};

export function FinalCelebration({ teams, roundCount }: FinalCelebrationProps) {
  const sorted = sortTeamsByScore(teams);
  const winner = sorted[0];

  return (
    <div className="relative flex min-h-dvh flex-col bg-ink">
      <Confetti />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="px-6 pt-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gold/60">
            Koniec teleturnieju
          </p>
          <h1 className="mt-2 font-display text-5xl text-gold sm:text-6xl">
            Wyniki końcowe
          </h1>
          <p className="mt-2 text-cream/50">
            {roundCount} rund za nami — dziękujemy za grę!
          </p>
        </div>

        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mt-8 w-full max-w-3xl px-6"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(245,197,66,0)",
                  "0 0 40px 8px rgba(245,197,66,0.35)",
                  "0 0 0 0 rgba(245,197,66,0)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="flex flex-col items-center gap-4 rounded-3xl border-2 border-gold/50 bg-gold/10 px-8 py-10 text-center sm:flex-row sm:text-left"
            >
              {winner.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={winner.photoDataUrl}
                  alt=""
                  className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-gold/40 sm:h-32 sm:w-32"
                />
              ) : (
                <div
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full font-display text-4xl text-ink ring-4 ring-gold/40 sm:h-32 sm:w-32 sm:text-5xl"
                  style={{ backgroundColor: winner.color }}
                >
                  {winner.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm uppercase tracking-widest text-gold/70">
                  Zwycięzca
                </p>
                <p className="font-display text-4xl text-gold sm:text-5xl">
                  {winner.name}
                </p>
                <p className="text-cream/60">Kapitan: {winner.captain}</p>
              </div>
              <p className="font-display text-6xl text-gold sm:text-7xl">
                {winner.score}
              </p>
            </motion.div>
          </motion.div>
        )}

        <div className="mt-6 flex-1 overflow-auto pb-8">
          <LeaderboardDisplay
            teams={teams}
            title="Pełna tabela"
            compact
            hideWinner={!!winner}
          />
        </div>

        <div className="relative z-10 flex justify-center gap-4 border-t border-white/10 p-6">
          <Link href="/">
            <Button variant="secondary">Strona główna</Button>
          </Link>
          <Link href="/prepare">
            <Button>Przygotuj nową edycję</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
