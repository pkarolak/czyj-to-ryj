"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FirebaseNotice } from "@/components/scores/FirebaseNotice";
import { LeaderboardDisplay } from "@/components/scores/LeaderboardDisplay";
import { RoomCodeInput } from "@/components/scores/RoomCodeInput";
import { Button } from "@/components/ui/Button";
import { useScoreRoom } from "@/hooks/useScoreRoom";

function ScoresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramCode = searchParams.get("room");
  const [roomCode, setRoomCode] = useState<string | null>(paramCode);

  const { room, isLoading, isConfigured, error } = useScoreRoom(roomCode);

  useEffect(() => {
    if (room && roomCode) {
      router.replace(`/scores?room=${roomCode}`, { scroll: false });
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
      <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
        <div className="text-center">
          <h1 className="font-display text-5xl text-gold">Tabela wyników</h1>
          <p className="mt-2 text-cream/50">Wpisz kod pokoju, aby wyświetlić punktację</p>
        </div>
        <RoomCodeInput
          initialCode={paramCode ?? ""}
          isLoading={isLoading}
          error={error}
          onSubmit={setRoomCode}
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
        Ładowanie punktacji…
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
        <p className="text-red-400">{error ?? "Nie znaleziono pokoju."}</p>
        <Button variant="secondary" onClick={() => setRoomCode(null)}>
          Inny kod
        </Button>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-ink">
      <LeaderboardDisplay teams={room.teams} />
    </div>
  );
}

export default function ScoresPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-cream/50">
          Ładowanie…
        </div>
      }
    >
      <ScoresContent />
    </Suspense>
  );
}
