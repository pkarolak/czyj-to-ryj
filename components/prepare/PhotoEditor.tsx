"use client";

import { useState } from "react";
import { CircularCropper } from "@/components/crop/CircularCropper";
import { RoundAnnotator } from "@/components/prepare/RoundAnnotator";
import { Card } from "@/components/ui/Card";
import { useTournament } from "@/context/TournamentContext";
import { isRoundCropped } from "@/lib/types/tournament";

type PhotoEditorProps = {
  roundId: string | null;
  onDone: () => void;
};

type EditorStep = "crop" | "annotate";

export function PhotoEditor({ roundId, onDone }: PhotoEditorProps) {
  const { tournament, updateRoundCrop } = useTournament();
  const roundIndex = tournament.rounds.findIndex((r) => r.id === roundId);
  const round = roundIndex >= 0 ? tournament.rounds[roundIndex] : null;

  const [step, setStep] = useState<EditorStep>(() =>
    round && isRoundCropped(round) ? "annotate" : "crop",
  );

  if (!round) return null;

  const imageSrc = round.originalPreviewUrl;

  if (!imageSrc?.startsWith("data:image/")) {
    return (
      <Card className="p-6">
        <p className="text-red-400">
          Nie udało się wczytać zdjęcia. Kliknij „Wyczyść wszystko” i dodaj plik
          ponownie (JPG, JPEG lub PNG).
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-4 text-sm text-cream/60 underline hover:text-cream"
        >
          Wróć
        </button>
      </Card>
    );
  }

  if (step === "annotate" && isRoundCropped(round)) {
    return (
      <RoundAnnotator
        round={round}
        roundIndex={roundIndex}
        onDone={onDone}
        onReCrop={() => setStep("crop")}
      />
    );
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 font-display text-2xl text-gold">
        Kadruj detal — zdjęcie {roundIndex + 1}
      </h2>
      <p className="mb-6 text-sm text-cream/50">
        Przesuń i powiększ zdjęcie, aby wybrać idealny detal twarzy lub ciała.
      </p>
      <CircularCropper
        key={round.id}
        imageSrc={imageSrc}
        onConfirm={async (blob, meta) => {
          await updateRoundCrop(round.id, blob, meta);
          setStep("annotate");
        }}
        onCancel={onDone}
      />
    </Card>
  );
}
