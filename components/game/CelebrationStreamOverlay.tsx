"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Confetti } from "@/components/game/Confetti";
import { Button } from "@/components/ui/Button";
import type { CelebrationStreamStatus } from "@/lib/webrtc/celebrationPeer";

type CelebrationStreamOverlayProps = {
  status: CelebrationStreamStatus;
  error: string | null;
  remoteStream: MediaStream | null;
  onClose: () => void;
};

function statusMessage(status: CelebrationStreamStatus): string {
  switch (status) {
    case "waiting":
      return "Czekamy na telefon… Włącz kamerę w panelu mobilnym.";
    case "connecting":
      return "Łączymy z kamerą…";
    case "connected":
      return "";
    case "error":
      return "";
    default:
      return "Przygotowujemy odbiór…";
  }
}

export function CelebrationStreamOverlay({
  status,
  error,
  remoteStream,
  onClose,
}: CelebrationStreamOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = remoteStream;
  }, [remoteStream]);

  const message = error ?? statusMessage(status);
  const showVideo = status === "connected" && remoteStream;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/85 p-4 backdrop-blur-sm">
      <Confetti scope="parent" />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-ink/80 text-cream/80 hover:text-cream"
        aria-label="Zamknij stream"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-4">
        <p className="font-display text-2xl text-gold sm:text-3xl">
          Jak oni świętują!
        </p>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gold/30 bg-ink">
          {showVideo ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center px-6 text-center">
              <p className="max-w-md text-cream/60">
                {message || "Ładowanie…"}
              </p>
            </div>
          )}
        </div>

        {status === "error" && (
          <Button variant="secondary" onClick={onClose}>
            Zamknij
          </Button>
        )}
      </div>
    </div>
  );
}
