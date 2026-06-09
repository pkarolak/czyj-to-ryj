"use client";

import { playNote } from "@/lib/audio/pianoPlayer";

const KEYS = [
  "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
  "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
];

const BLACK = new Set(KEYS.filter((k) => k.includes("#")));

type PianoKeyboardProps = {
  onNote: (note: string) => void;
  disabled?: boolean;
};

export function PianoKeyboard({ onNote, disabled }: PianoKeyboardProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {KEYS.map((note) => (
        <button
          key={note}
          type="button"
          disabled={disabled}
          onClick={() => {
            void playNote(note, 400);
            if (!disabled) onNote(note);
          }}
          className={`rounded px-2 py-2 text-xs transition-colors disabled:opacity-50 ${
            BLACK.has(note)
              ? "bg-ink text-cream/80 hover:bg-ink/80"
              : "bg-cream/90 text-ink hover:bg-white"
          }`}
        >
          {note}
        </button>
      ))}
    </div>
  );
}
