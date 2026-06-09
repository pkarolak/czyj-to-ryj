"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GuessingPhase } from "@/components/game/GuessingPhase";
import { RevealedPhase } from "@/components/game/RevealedPhase";
import { RoundScoringPanel } from "@/components/game/RoundScoringPanel";
import { ScoresOverlay } from "@/components/game/ScoresOverlay";
import { Button } from "@/components/ui/Button";
import { useScoreRoom } from "@/hooks/useScoreRoom";
import { useTournament } from "@/context/TournamentContext";
import { REVEAL_NAME_DELAY } from "@/lib/game/constants";
import { getStoredRoomCode } from "@/lib/scores/roomService";
import { allRoundsReady } from "@/lib/types/tournament";

type GamePhase = "intro" | "guessing" | "revealed" | "complete";

export function GameScreen() {
  const { tournament, isLoading } = useTournament();
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [roomCode] = useState(() => getStoredRoomCode());
  const sirenRef = useRef<HTMLAudioElement | null>(null);

  const {
    room: scoreRoom,
    recordRoundScore,
    updateCurrentRound,
  } = useScoreRoom(roomCode);

  const rounds = tournament.rounds;
  const round = rounds[roundIndex] ?? null;
  const isLastRound = roundIndex >= rounds.length - 1;

  useEffect(() => {
    if (!roomCode || !scoreRoom) return;
    void updateCurrentRound(roundIndex + 1);
  }, [roomCode, scoreRoom, roundIndex, updateCurrentRound]);

  const playSiren = useCallback(() => {
    if (!sirenRef.current) {
      sirenRef.current = new Audio("/sounds/siren.mp3");
    }
    void sirenRef.current.play().catch(() => {});
  }, []);

  const handleStart = () => setPhase("guessing");

  const handleReveal = () => {
    if (phase !== "guessing") return;
    setPhase("revealed");
  };

  const handleNextRound = () => {
    if (isLastRound) {
      setPhase("complete");
      return;
    }
    setRoundIndex((i) => i + 1);
    setPhase("intro");
  };

  const handleRoundScore = async (teamIds: string[]) => {
    if (!roomCode || !round) return;
    await recordRoundScore(round.id, teamIds, roundIndex + 1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-cream/50">
        Ładowanie…
      </div>
    );
  }

  if (!allRoundsReady(rounds)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-display text-4xl text-gold">Brak gotowych rund</h1>
        <p className="max-w-md text-cream/60">
          Każde zdjęcie musi mieć detal, imię i nazwisko oraz marker postaci w
          trybie prowadzącego.
        </p>
        <Link href="/prepare">
          <Button variant="secondary">Tryb prowadzącego</Button>
        </Link>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <>
        <ScoresOverlay room={scoreRoom} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
        >
          <h1 className="font-display text-5xl text-gold">Koniec teleturnieju!</h1>
          <p className="text-cream/60">
            Wszystkie {rounds.length} rund zakończone. Dziękujemy za grę!
          </p>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="secondary">Strona główna</Button>
            </Link>
            <Link href="/prepare">
              <Button>Przygotuj nową edycję</Button>
            </Link>
          </div>
        </motion.div>
      </>
    );
  }

  if (!round?.croppedPreviewUrl) return null;

  const hasScoreTeams =
    scoreRoom && Object.keys(scoreRoom.teams ?? {}).length > 0;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScoresOverlay room={scoreRoom} />

      <header className="flex items-center gap-4 px-4 py-6 sm:px-8">
        <Link
          href="/"
          className="shrink-0 rounded-full p-2 text-cream/50 transition-colors hover:bg-white/5 hover:text-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gold/60">
            {tournament.name}
          </p>
          <p className="font-display text-lg text-cream/80">
            Runda {roundIndex + 1} / {rounds.length}
          </p>
        </div>
        {phase === "revealed" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: REVEAL_NAME_DELAY + 0.3 }}
            className="shrink-0"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextRound}
              className="text-xs sm:text-sm"
            >
              {isLastRound ? "Zakończ" : "Dalej"}
            </Button>
          </motion.div>
        ) : (
          <div className="w-9 shrink-0" />
        )}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <p className="text-sm uppercase tracking-[0.4em] text-gold/70">
                Przygotuj się
              </p>
              <h1 className="mt-2 font-display text-7xl text-gold sm:text-8xl">
                RUNDA {roundIndex + 1}
              </h1>
              <Button size="lg" className="mt-12 px-16 py-6 text-2xl" onClick={handleStart}>
                START
              </Button>
            </motion.div>
          )}

          <LayoutGroup id={`round-${round.id}`}>
            {phase === "guessing" && (
              <GuessingPhase
                key={`guessing-${roundIndex}`}
                croppedPreviewUrl={round.croppedPreviewUrl}
                onReveal={handleReveal}
                onTimeUp={playSiren}
              />
            )}

            {phase === "revealed" && (
              <motion.div
                key="revealed"
                className="flex w-full flex-col items-center"
              >
                <RevealedPhase round={round} />
                {hasScoreTeams && scoreRoom && (
                  <RoundScoringPanel
                    key={round.id}
                    room={scoreRoom}
                    roundId={round.id}
                    onConfirm={handleRoundScore}
                  />
                )}
              </motion.div>
            )}
          </LayoutGroup>
        </AnimatePresence>
      </main>
    </div>
  );
}
