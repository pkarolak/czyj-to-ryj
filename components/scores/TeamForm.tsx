"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TEAM_COLORS, type Team } from "@/lib/types/scoreRoom";

type TeamFormProps = {
  onAdd: (team: Team) => Promise<void>;
  teamCount?: number;
};

const MAX_PHOTO_BYTES = 200 * 1024;

export function TeamForm({ onAdd, teamCount = 0 }: TeamFormProps) {
  const [name, setName] = useState("");
  const [captain, setCaptain] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[teamCount % TEAM_COLORS.length]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_PHOTO_BYTES) {
      alert("Zdjęcie jest za duże (max 200 KB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhotoDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !captain.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        captain: captain.trim(),
        score: 0,
        color,
        photoDataUrl,
      });
      setName("");
      setCaptain("");
      setPhotoDataUrl(null);
      setColor(TEAM_COLORS[(teamCount + 1) % TEAM_COLORS.length]);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <h3 className="mb-4 font-display text-xl text-gold">Dodaj drużynę</h3>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nazwa drużyny"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-cream outline-none focus:border-gold/50"
        />
        <input
          type="text"
          value={captain}
          onChange={(e) => setCaptain(e.target.value)}
          placeholder="Kapitan"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-cream outline-none focus:border-gold/50"
        />

        <div className="flex flex-wrap gap-2">
          {TEAM_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full ring-2 transition-transform ${
                color === c ? "scale-110 ring-gold" : "ring-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Kolor ${c}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            {photoDataUrl ? "Zmień zdjęcie" : "Zdjęcie (opcja)"}
          </Button>
          {photoDataUrl && (
            <button
              type="button"
              onClick={() => {
                setPhotoDataUrl(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-xs text-cream/40 underline"
            >
              Usuń
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
        </div>

        <Button
          type="submit"
          disabled={!name.trim() || !captain.trim() || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Dodawanie…" : "Dodaj drużynę"}
        </Button>
      </div>
    </form>
  );
}
