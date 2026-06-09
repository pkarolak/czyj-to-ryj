"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategorySplash } from "@/components/game/CategorySplash";
import { FinalCelebration } from "@/components/game/FinalCelebration";
import { GuessingPhase } from "@/components/game/GuessingPhase";
import { HarmonyPlayingPhase } from "@/components/game/harmony/HarmonyPlayingPhase";
import { HarmonyRevealPhase } from "@/components/game/harmony/HarmonyRevealPhase";
import { RevealedPhase } from "@/components/game/RevealedPhase";
import { RoundScoringPanel } from "@/components/game/RoundScoringPanel";
import { ScoresOverlay } from "@/components/game/ScoresOverlay";
import { SectionBreakScreen } from "@/components/game/SectionBreakScreen";
import { TriviaQuestionPhase } from "@/components/game/trivia/TriviaQuestionPhase";
import { TriviaRevealPhase } from "@/components/game/trivia/TriviaRevealPhase";
import { Button } from "@/components/ui/Button";
import { useScoreRoom } from "@/hooks/useScoreRoom";
import { useTournament } from "@/context/TournamentContext";
import { unlockAudio } from "@/lib/audio/pianoPlayer";
import { REVEAL_NAME_DELAY } from "@/lib/game/constants";
import { getStoredRoomCode } from "@/lib/scores/roomService";
import {
  isFirstRoundOfSection,
  isLastRoundOfSection,
  roundNumberInSection,
} from "@/lib/show/sectionUtils";
import {
  buildShowQueue,
  DEFAULT_TIMER_SECONDS,
  isShowReady,
  type CompetitionId,
} from "@/lib/types/tournament";

type GamePhase =
  | "sectionSplash"
  | "intro"
  | "active"
  | "revealed"
  | "sectionBreak"
  | "complete";

export function GameScreen() {
  const { tournament, isLoading } = useTournament();
  const [queueIndex, setQueueIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("sectionSplash");
  const [roomCode] = useState(() => getStoredRoomCode());
  const sirenRef = useRef<HTMLAudioElement | null>(null);

  const queue = useMemo(() => buildShowQueue(tournament), [tournament]);
  const current = queue[queueIndex] ?? null;
  const isLastRound = queueIndex >= queue.length - 1;
  const roundInSection = current
    ? roundNumberInSection(queue, queueIndex)
    : 0;

  const timerSeconds = current
    ? (tournament.timerSeconds?.[current.type as CompetitionId] ??
      DEFAULT_TIMER_SECONDS[current.type as CompetitionId])
    : DEFAULT_TIMER_SECONDS.face;

  const {
    room: scoreRoom,
    recordRoundScore,
    updateCurrentRound,
  } = useScoreRoom(roomCode);

  useEffect(() => {
    if (!roomCode || !scoreRoom) return;
    void updateCurrentRound(queueIndex + 1);
  }, [roomCode, scoreRoom, queueIndex, updateCurrentRound]);

  const playSiren = useCallback(() => {
    if (!sirenRef.current) {
      sirenRef.current = new Audio("/sounds/siren.mp3");
    }
    void sirenRef.current.play().catch(() => {});
  }, []);

  const handleSectionSplashContinue = () => setPhase("intro");

  const handleStart = () => {
    if (current?.type === "harmony") {
      void unlockAudio();
    }
    setPhase("active");
  };

  const handleReveal = () => {
    if (phase !== "active") return;
    setPhase("revealed");
  };

  const handleNextRound = () => {
    if (isLastRound) {
      setPhase("complete");
      return;
    }
    if (isLastRoundOfSection(queue, queueIndex)) {
      setPhase("sectionBreak");
      return;
    }
    const nextIndex = queueIndex + 1;
    setQueueIndex(nextIndex);
    setPhase(
      isFirstRoundOfSection(queue, nextIndex) ? "sectionSplash" : "intro",
    );
  };

  const handleSectionBreakContinue = () => {
    setQueueIndex((i) => i + 1);
    setPhase("sectionSplash");
  };

  const handleRoundScore = async (teamIds: string[]) => {
    if (!roomCode || !current) return;
    await recordRoundScore(current.id, teamIds, queueIndex + 1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-cream/50">
        Ładowanie…
      </div>
    );
  }

  if (!isShowReady(tournament)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-display text-4xl text-gold">Brak gotowych rund</h1>
        <p className="max-w-md text-cream/60">
          Przygotuj przynajmniej jedną gotową rundę w dowolnej sekcji teleturnieju.
        </p>
        <Link href="/prepare">
          <Button variant="secondary">Tryb prowadzącego</Button>
        </Link>
      </div>
    );
  }

  if (phase === "complete") {
    if (scoreRoom && Object.keys(scoreRoom.teams ?? {}).length > 0) {
      return (
        <FinalCelebration
          teams={scoreRoom.teams}
          roundCount={queue.length}
        />
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
      >
        <h1 className="font-display text-5xl text-gold">Koniec teleturnieju!</h1>
        <p className="text-cream/60">
          Wszystkie {queue.length} rund zakończone. Dziękujemy za grę!
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

  if (!current) return null;

  const hasScoreTeams =
    scoreRoom && Object.keys(scoreRoom.teams ?? {}).length > 0;

  const showGameHeader =
    phase !== "sectionSplash" && phase !== "sectionBreak";

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScoresOverlay room={scoreRoom} />

      {phase === "sectionBreak" && hasScoreTeams && scoreRoom && (
        <SectionBreakScreen
          teams={scoreRoom.teams}
          sectionTitle={current.sectionLabel}
          onContinue={handleSectionBreakContinue}
        />
      )}

      {phase === "sectionBreak" && !hasScoreTeams && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
          <h2 className="font-display text-4xl text-gold">
            Koniec: {current.sectionLabel}
          </h2>
          <p className="text-cream/50">Brak drużyn w sesji punktowej.</p>
          <Button size="lg" onClick={handleSectionBreakContinue}>
            Kontynuuj show
          </Button>
        </div>
      )}

      {showGameHeader && (
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
            <p className="text-xs text-cream/40">{current.sectionLabel}</p>
            <p className="font-display text-lg text-cream/80">
              Runda {roundInSection} · {queueIndex + 1}/{queue.length}
            </p>
          </div>
          {phase === "revealed" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: current.type === "face" ? REVEAL_NAME_DELAY + 0.3 : 0.1,
              }}
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
      )}

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <AnimatePresence mode="wait">
          {phase === "sectionSplash" && (
            <CategorySplash
              title={current.sectionLabel}
              onContinue={handleSectionSplashContinue}
            />
          )}

          {phase === "intro" && (
            <motion.div
              key={`intro-${current.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <p className="text-sm uppercase tracking-[0.4em] text-gold/70">
                {current.sectionLabel}
              </p>
              <h1 className="mt-2 font-display text-7xl text-gold sm:text-8xl">
                RUNDA {roundInSection}
              </h1>
              <Button
                size="lg"
                className="mt-12 px-16 py-6 text-2xl"
                onClick={handleStart}
              >
                START
              </Button>
            </motion.div>
          )}

          {phase === "active" && current.type === "face" && current.data.croppedPreviewUrl && (
            <LayoutGroup id={`round-${current.id}`}>
              <GuessingPhase
                key={`guessing-${queueIndex}`}
                croppedPreviewUrl={current.data.croppedPreviewUrl}
                timerSeconds={timerSeconds}
                onReveal={handleReveal}
                onTimeUp={playSiren}
              />
            </LayoutGroup>
          )}

          {phase === "active" && current.type === "harmony" && (
            <HarmonyPlayingPhase
              key={`harmony-${current.id}`}
              round={current.data}
              timerSeconds={timerSeconds}
              onReveal={handleReveal}
              onTimeUp={playSiren}
            />
          )}

          {phase === "active" && current.type === "trivia" && (
            <TriviaQuestionPhase
              key={`trivia-q-${current.id}`}
              round={current.data}
              timerSeconds={timerSeconds}
              onReveal={handleReveal}
              onTimeUp={playSiren}
            />
          )}

          {phase === "revealed" && current.type === "face" && (
            <LayoutGroup id={`round-${current.id}`}>
              <motion.div
                key="revealed-face"
                className="flex w-full flex-col items-center"
              >
                <RevealedPhase round={current.data} />
                {hasScoreTeams && scoreRoom && (
                  <RoundScoringPanel
                    key={current.id}
                    room={scoreRoom}
                    roundId={current.id}
                    onConfirm={handleRoundScore}
                  />
                )}
              </motion.div>
            </LayoutGroup>
          )}

          {phase === "revealed" && current.type === "harmony" && (
            <motion.div
              key="revealed-harmony"
              className="flex w-full flex-col items-center gap-8"
            >
              <HarmonyRevealPhase round={current.data} />
              {hasScoreTeams && scoreRoom && (
                <RoundScoringPanel
                  key={current.id}
                  room={scoreRoom}
                  roundId={current.id}
                  onConfirm={handleRoundScore}
                />
              )}
            </motion.div>
          )}

          {phase === "revealed" && current.type === "trivia" && (
            <motion.div
              key="revealed-trivia"
              className="flex w-full flex-col items-center gap-8"
            >
              <TriviaRevealPhase round={current.data} />
              {hasScoreTeams && scoreRoom && (
                <RoundScoringPanel
                  key={current.id}
                  room={scoreRoom}
                  roundId={current.id}
                  onConfirm={handleRoundScore}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
