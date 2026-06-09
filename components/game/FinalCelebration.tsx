"use client";

import { motion } from "framer-motion";
import { Video } from "lucide-react";
import Link from "next/link";
import { Confetti } from "@/components/game/Confetti";
import { CelebrationStreamOverlay } from "@/components/game/CelebrationStreamOverlay";
import {
  getWinnerDisplayConfig,
  WinnerCelebrationCard,
} from "@/components/game/WinnerCelebrationCard";
import { LeaderboardDisplay } from "@/components/scores/LeaderboardDisplay";
import { Button } from "@/components/ui/Button";
import { useCelebrationViewer } from "@/hooks/useCelebrationStream";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { getTopTeams, type Team } from "@/lib/types/scoreRoom";

type FinalCelebrationProps = {
  teams: Record<string, Team>;
  roomCode: string | null;
};

export function FinalCelebration({ teams, roomCode }: FinalCelebrationProps) {
  const winners = getTopTeams(teams);
  const multiple = winners.length > 1;
  const showLeaderboard = winners.length < Object.keys(teams).length;
  const layout = getWinnerDisplayConfig(winners.length);
  const canStream = Boolean(roomCode && isFirebaseConfigured());
  const { status, error, remoteStream, isOpen, openStream, closeStream } =
    useCelebrationViewer(roomCode);

  return (
    <div className="relative flex min-h-dvh flex-col bg-ink">
      <Confetti />

      {canStream && (
        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => void openStream()}
          >
            <Video className="h-4 w-4" />
            Jak oni świętują
          </Button>
        </div>
      )}

      {isOpen && (
        <CelebrationStreamOverlay
          status={status}
          error={error}
          remoteStream={remoteStream}
          onClose={() => void closeStream()}
        />
      )}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div
          className={`shrink-0 px-6 text-center ${
            layout.headerCompact ? "pt-6" : "pt-10"
          }`}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-gold/60">
            Koniec teleturnieju
          </p>
          <h1
            className={`mt-2 font-display text-gold ${
              layout.headerCompact
                ? "text-3xl sm:text-4xl"
                : "text-4xl sm:text-5xl lg:text-6xl"
            }`}
          >
            Już wiemy czyj to ryj!
          </h1>
        </div>

        {winners.length > 0 && (
          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex min-h-0 flex-col px-6 ${
              showLeaderboard ? "shrink-0 py-4" : "flex-1 py-6"
            }`}
          >
            {multiple && (
              <p className="mb-3 shrink-0 text-center text-sm uppercase tracking-widest text-gold/70">
                Zwycięzcy
              </p>
            )}
            <div
              className={`grid gap-3 ${layout.gridClass} ${
                showLeaderboard ? "" : "flex-1 content-center"
              }`}
            >
              {winners.map((team) => (
                <WinnerCelebrationCard
                  key={team.id}
                  team={team}
                  variant={layout.variant}
                  density={layout.density}
                />
              ))}
            </div>
          </motion.section>
        )}

        {showLeaderboard && (
          <div className="min-h-0 flex-1 overflow-auto pb-4">
            <LeaderboardDisplay
              teams={teams}
              title="Pełna tabela"
              compact
              hideTopCount={winners.length}
            />
          </div>
        )}

        <div className="relative z-10 flex shrink-0 justify-center gap-4 border-t border-white/10 p-6">
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
