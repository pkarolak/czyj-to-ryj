"use client";

import { ChevronDown, Monitor, Plus, Unplug } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FirebaseNotice } from "@/components/scores/FirebaseNotice";
import { RoomCodeInput } from "@/components/scores/RoomCodeInput";
import { ScoreControlCard } from "@/components/scores/ScoreControlCard";
import { TeamForm } from "@/components/scores/TeamForm";
import { Button } from "@/components/ui/Button";
import { useScoreRoom } from "@/hooks/useScoreRoom";
import { getStoredRoomCode, storeRoomCode } from "@/lib/scores/roomService";
import { sortTeamsByScore } from "@/lib/types/scoreRoom";

function RemoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramCode = searchParams.get("room");
  const [roomCode, setRoomCode] = useState<string | null>(
    () => paramCode ?? getStoredRoomCode(),
  );
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showAddTeam, setShowAddTeam] = useState(false);

  const {
    room,
    isLoading,
    isConfigured,
    error,
    adjustScore,
    addTeamToRoom,
    setShowScores,
  } = useScoreRoom(roomCode);

  useEffect(() => {
    if (room && roomCode) {
      storeRoomCode(roomCode);
      router.replace(`/remote?room=${roomCode}`, { scroll: false });
    }
  }, [room, roomCode, router]);

  if (!isConfigured) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <FirebaseNotice />
      </div>
    );
  }

  if (!roomCode || (!room && !isLoading)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="text-center">
          <h1 className="font-display text-4xl text-gold">Panel mobilny</h1>
          <p className="mt-2 text-cream/50">
            Wpisz kod pokoju wygenerowany przez prowadzącego
          </p>
        </div>
        <RoomCodeInput
          initialCode={paramCode ?? ""}
          isLoading={isLoading}
          error={joinError ?? error}
          onSubmit={(code) => {
            setJoinError(null);
            setRoomCode(code);
          }}
        />
        <Link href="/" className="text-sm text-cream/40 underline">
          Strona główna
        </Link>
      </div>
    );
  }

  if (isLoading && !room) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-cream/50">
        Łączenie z pokojem {roomCode}…
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
        <p className="text-red-400">{error ?? "Nie znaleziono pokoju."}</p>
        <Button variant="secondary" onClick={() => setRoomCode(null)}>
          Spróbuj inny kod
        </Button>
      </div>
    );
  }

  const teams = sortTeamsByScore(room.teams);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6 pb-28">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/60">
            Pokój
          </p>
          <p className="font-display text-3xl text-gold">{roomCode}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRoomCode(null);
            setJoinError(null);
          }}
          className="flex items-center gap-1 text-sm text-cream/40"
        >
          <Unplug className="h-4 w-4" />
          Zmień kod
        </button>
      </header>

      <section>
        <h2 className="mb-4 font-display text-2xl text-cream/80">Punktacja</h2>
        {teams.length === 0 ? (
          <p className="text-sm text-cream/40">
            Brak drużyn — użyj przycisku poniżej, aby dodać pierwszą.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {teams.map((team) => (
              <ScoreControlCard
                key={team.id}
                team={team}
                onAdjust={(delta) => adjustScore(team.id, delta)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setShowAddTeam((open) => !open)}
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Dodaj drużynę
          </span>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${showAddTeam ? "rotate-180" : ""}`}
          />
        </Button>

        {showAddTeam && (
          <div className="mt-3">
            <TeamForm
              teamCount={teams.length}
              onAdd={async (team) => {
                await addTeamToRoom(team);
                setShowAddTeam(false);
              }}
            />
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-ink/95 p-4 backdrop-blur">
        <Button
          size="lg"
          variant={room.showScores ? "secondary" : "primary"}
          className="w-full"
          onClick={() => setShowScores(!room.showScores)}
        >
          <Monitor className="h-5 w-5" />
          {room.showScores
            ? "Ukryj punktację na rzutniku"
            : "Pokaż punktację na rzutniku"}
        </Button>
      </div>
    </div>
  );
}

export default function RemotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-cream/50">
          Ładowanie…
        </div>
      }
    >
      <RemoteContent />
    </Suspense>
  );
}
