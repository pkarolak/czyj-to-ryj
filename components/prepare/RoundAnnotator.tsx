"use client";

import { useState } from "react";
import {
  createInitialMarker,
  FocusMarkerEditor,
} from "@/components/focus/FocusMarkerEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTournament } from "@/context/TournamentContext";
import type { FocusMarker, RoundEntry } from "@/lib/types/tournament";

type RoundAnnotatorProps = {
  round: RoundEntry;
  roundIndex: number;
  onDone: () => void;
  onReCrop?: () => void;
};

export function RoundAnnotator({
  round,
  roundIndex,
  onDone,
  onReCrop,
}: RoundAnnotatorProps) {
  const { updateRoundDetails } = useTournament();
  const [personName, setPersonName] = useState(round.personName);
  const [marker, setMarker] = useState<FocusMarker>(
    createInitialMarker(round.focusMarker),
  );

  const handleSave = () => {
    updateRoundDetails(round.id, {
      personName: personName.trim(),
      focusMarker: marker,
    });
    onDone();
  };

  return (
    <Card className="p-6">
      <h2 className="mb-2 font-display text-2xl text-gold">
        Oznacz postać — zdjęcie {roundIndex + 1}
      </h2>
      <p className="mb-6 text-sm text-cream/50">
        Podaj imię i nazwisko oraz zaznacz kółeczkiem, na kogo patrzeć na
        zdjęciu grupowym.
      </p>

      <div className="mb-6">
        <label className="mb-2 block text-sm text-cream/60">
          Imię i nazwisko
        </label>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="np. Jan Kowalski"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold/50 sm:max-w-md"
        />
      </div>

      <FocusMarkerEditor
        imageSrc={round.originalPreviewUrl}
        marker={marker}
        onChange={setMarker}
      />

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        {onReCrop && (
          <Button variant="ghost" onClick={onReCrop}>
            Przekadruj detal
          </Button>
        )}
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button
          onClick={handleSave}
          disabled={!personName.trim()}
        >
          Zapisz
        </Button>
      </div>
    </Card>
  );
}
