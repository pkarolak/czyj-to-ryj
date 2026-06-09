"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { GuessingPhase } from "@/components/game/GuessingPhase";
import { Button } from "@/components/ui/Button";
import { useTournament } from "@/context/TournamentContext";
import { REVEAL_LAYOUT_ID } from "@/lib/game/constants";
import { allRoundsCropped } from "@/lib/types/tournament";

type GamePhase = "intro" | "guessing" | "revealed" | "complete";

export function GameScreen() {
  const { tournament, isLoading } = useTournament();
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const sirenRef = useRef<HTMLAudioElement | null>(null);

  const rounds = tournament.rounds;
  const round = rounds[roundIndex] ?? null;
  const isLastRound = roundIndex >= rounds.length - 1;

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

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-cream/50">
        Ładowanie…
      </div>
    );
  }

  if (!allRoundsCropped(rounds)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-display text-4xl text-gold">Brak gotowych rund</h1>
        <p className="max-w-md text-cream/60">
          Upewnij się, że wszystkie zdjęcia mają skadrowany detal w trybie
          prowadzącego.
        </p>
        <Link href="/prepare">
          <Button variant="secondary">Tryb prowadzącego</Button>
        </Link>
      </div>
    );
  }

  if (phase === "complete") {
    return (
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
    );
  }

  if (!round?.croppedPreviewUrl) return null;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center gap-4 px-4 py-6 sm:px-8">
        <Link
          href="/"
          className="rounded-full p-2 text-cream/50 transition-colors hover:bg-white/5 hover:text-cream"
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
        <div className="w-9" />
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

            {phase === "revealed" && round.originalPreviewUrl && (
              <motion.div
                key="revealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full max-w-3xl flex-col items-center"
              >
                <motion.div
                  layoutId={REVEAL_LAYOUT_ID}
                  className="relative z-10 max-h-[70vh] w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-2 ring-gold/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- oryginał dopiero po kliknięciu */}
                  <img
                    src={round.originalPreviewUrl}
                    alt="Ujawnione zdjęcie"
                    className="h-full w-full object-contain"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-10"
                >
                  <Button variant="ghost" size="md" onClick={handleNextRound}>
                    {isLastRound ? "Zakończ teleturniej" : "Kolejna runda"}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </LayoutGroup>
        </AnimatePresence>
      </main>
    </div>
  );
}
