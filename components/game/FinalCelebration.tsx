"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Confetti } from "@/components/game/Confetti";
import { WinnerCelebrationCard } from "@/components/game/WinnerCelebrationCard";
import { LeaderboardDisplay } from "@/components/scores/LeaderboardDisplay";
import { Button } from "@/components/ui/Button";
import { getTopTeams, type Team } from "@/lib/types/scoreRoom";

type FinalCelebrationProps = {
  teams: Record<string, Team>;
  roundCount: number;
};

export function FinalCelebration({ teams, roundCount }: FinalCelebrationProps) {
  const winners = getTopTeams(teams);
  const multiple = winners.length > 1;
  const compactCards = winners.length > 1;

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

        {winners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mt-8 w-full max-w-4xl px-6"
          >
            <p className="mb-4 text-center text-sm uppercase tracking-widest text-gold/70">
              {multiple ? "Zwycięzcy" : "Zwycięzca"}
              {multiple && (
                <span className="mt-1 block text-xs normal-case tracking-normal text-cream/40">
                  Remis — {winners.length}{" "}
                  {winners.length < 5
                    ? "drużyny na szczycie"
                    : "drużyn na szczycie"}
                </span>
              )}
            </p>
            <div
              className={`flex flex-col gap-4 ${
                winners.length === 2 ? "sm:grid sm:grid-cols-2" : ""
              }`}
            >
              {winners.map((team) => (
                <WinnerCelebrationCard
                  key={team.id}
                  team={team}
                  compact={compactCards}
                />
              ))}
            </div>
          </motion.div>
        )}

        {winners.length < Object.keys(teams).length && (
          <div className="mt-6 flex-1 overflow-auto pb-8">
            <LeaderboardDisplay
              teams={teams}
              title="Pełna tabela"
              compact
              hideTopCount={winners.length}
            />
          </div>
        )}

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
