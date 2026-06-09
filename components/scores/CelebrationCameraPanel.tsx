"use client";

import { Video, VideoOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useCelebrationPublisher } from "@/hooks/useCelebrationStream";
import type { CelebrationState, GamePhase } from "@/lib/types/scoreRoom";

type CelebrationCameraPanelProps = {
  roomCode: string;
  gamePhase: GamePhase;
  celebration: CelebrationState;
};

export function CelebrationCameraPanel({
  roomCode,
  gamePhase,
  celebration,
}: CelebrationCameraPanelProps) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const { status, error, localStream, isPublishing, startPublishing, stopPublishing } =
    useCelebrationPublisher(roomCode);

  const visible =
    gamePhase === "complete" || celebration.requested || celebration.active;

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    video.srcObject = localStream;
  }, [localStream]);

  if (!visible) return null;

  return (
    <section className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-4">
      <div className="flex items-start gap-3">
        <Video className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-gold">Celebracja na żywo</h2>
          <p className="mt-1 text-sm text-cream/50">
            {celebration.requested && !isPublishing
              ? "Rzutnik czeka na kamerę — pokaż jak świętujecie!"
              : "Po zakończeniu show możesz przesłać obraz z telefonu na rzutnik."}
          </p>
        </div>
      </div>

      {localStream && (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <video
            ref={previewRef}
            autoPlay
            playsInline
            muted
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {status === "connecting" && !error && (
        <p className="mt-3 text-sm text-cream/50">Łączenie ze rzutnikiem…</p>
      )}

      {status === "connected" && (
        <p className="mt-3 text-sm text-gold/80">Transmisja aktywna</p>
      )}

      <div className="mt-4">
        {isPublishing ? (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => void stopPublishing()}
          >
            <VideoOff className="h-4 w-4" />
            Zakończ transmisję
          </Button>
        ) : (
          <Button className="w-full" onClick={() => void startPublishing()}>
            <Video className="h-4 w-4" />
            Pokaż jak świętujecie
          </Button>
        )}
      </div>
    </section>
  );
}
