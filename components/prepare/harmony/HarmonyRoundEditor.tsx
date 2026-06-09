"use client";

import { useState } from "react";
import { PianoKeyboard } from "@/components/harmony/PianoKeyboard";
import { Button } from "@/components/ui/Button";
import { useTournament } from "@/context/TournamentContext";
import { playSequence } from "@/lib/audio/pianoPlayer";
import {
  isHarmonyRoundReady,
  isValidNotePitch,
  MAX_HARMONY_NOTES,
  parseNoteSequence,
  type HarmonyRound,
} from "@/lib/types/tournament";

type HarmonyRoundEditorProps = {
  initial?: HarmonyRound;
  onDone: () => void;
};

export function HarmonyRoundEditor({ initial, onDone }: HarmonyRoundEditorProps) {
  const { addHarmonyRound, updateHarmonyRound } = useTournament();
  const [songTitle, setSongTitle] = useState(initial?.songTitle ?? "");
  const [notesInput, setNotesInput] = useState(initial?.notes.join(", ") ?? "");
  const [notes, setNotes] = useState<string[]>(initial?.notes ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const syncFromInput = (value: string) => {
    setNotesInput(value);
    setNotes(parseNoteSequence(value));
  };

  const addNote = (note: string) => {
    if (notes.length >= MAX_HARMONY_NOTES) {
      setError(`Maksymalnie ${MAX_HARMONY_NOTES} dźwięków.`);
      return;
    }
    const next = [...notes, note];
    setNotes(next);
    setNotesInput(next.join(", "));
    setError(null);
  };

  const removeNote = (index: number) => {
    const next = notes.filter((_, i) => i !== index);
    setNotes(next);
    setNotesInput(next.join(", "));
  };

  const handlePreview = async () => {
    setIsPlaying(true);
    try {
      await playSequence(notes);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft = { notes, songTitle: songTitle.trim() };
    if (!isHarmonyRoundReady({ id: "", ...draft })) {
      setError("Podaj tytuł i co najmniej jedną poprawną nutę (np. C4, E4, G4).");
      return;
    }
    if (notes.some((n) => !isValidNotePitch(n))) {
      setError("Nieprawidłowa notacja. Użyj formatu C4, D#4, Eb3.");
      return;
    }

    setIsSaving(true);
    try {
      if (initial) {
        updateHarmonyRound(initial.id, draft);
      } else {
        addHarmonyRound(draft);
      }
      onDone();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <h3 className="mb-4 font-display text-xl text-gold">
        {initial ? "Edytuj zagadkę" : "Nowa zagadka — Jaka to harmonia?"}
      </h3>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-cream/60">Tytuł utworu</label>
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="np. Hallelujah"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-cream outline-none focus:border-gold/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-cream/60">
            Sekwencja dźwięków (max {MAX_HARMONY_NOTES})
          </label>
          <input
            type="text"
            value={notesInput}
            onChange={(e) => syncFromInput(e.target.value)}
            placeholder="C4, E4, G4, C5"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-cream outline-none focus:border-gold/50"
          />
          <p className="mt-1 text-xs text-cream/40">
            Wpisz nuty oddzielone przecinkiem lub spacją. Kliknij klawisz poniżej,
            aby dodać.
          </p>
        </div>

        {notes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {notes.map((note, i) => (
              <button
                key={`${note}-${i}`}
                type="button"
                onClick={() => removeNote(i)}
                className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm text-gold"
              >
                {note} ×
              </button>
            ))}
          </div>
        )}

        <PianoKeyboard onNote={addNote} disabled={notes.length >= MAX_HARMONY_NOTES} />

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={!notes.length || isPlaying}
            onClick={() => void handlePreview()}
          >
            {isPlaying ? "Odtwarzanie…" : "Podgląd dźwięków"}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onDone}>
            Anuluj
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Zapisywanie…" : initial ? "Zapisz" : "Dodaj zagadkę"}
          </Button>
        </div>
      </div>
    </form>
  );
}
