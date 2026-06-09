"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  resizeTeamPhotoToDataUrl,
  TEAM_PHOTO_MAX_INPUT_BYTES,
} from "@/lib/images/resizeTeamPhoto";
import { TEAM_COLORS, type Team } from "@/lib/types/scoreRoom";

type TeamFormProps = {
  onAdd: (team: Team) => Promise<void>;
  teamCount?: number;
};

export function TeamForm({ onAdd, teamCount = 0 }: TeamFormProps) {
  const [name, setName] = useState("");
  const [captain, setCaptain] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[teamCount % TEAM_COLORS.length]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    setIsProcessingPhoto(true);
    try {
      const dataUrl = await resizeTeamPhotoToDataUrl(file);
      setPhotoDataUrl(dataUrl);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Nie udało się wczytać zdjęcia.",
      );
    } finally {
      setIsProcessingPhoto(false);
    }
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
      setPhotoError(null);
      setColor(TEAM_COLORS[(teamCount + 1) % TEAM_COLORS.length]);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxMb = Math.round(TEAM_PHOTO_MAX_INPUT_BYTES / 1024 / 1024);

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

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isProcessingPhoto}
              onClick={() => fileRef.current?.click()}
            >
              {isProcessingPhoto
                ? "Przetwarzanie…"
                : photoDataUrl
                  ? "Zmień zdjęcie"
                  : "Zdjęcie (opcja)"}
            </Button>
            {photoDataUrl && (
              <button
                type="button"
                onClick={() => {
                  setPhotoDataUrl(null);
                  setPhotoError(null);
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
              capture="environment"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
          </div>
          <p className="text-xs text-cream/40">
            Zdjęcie z telefonu do {maxMb} MB — automatycznie zmniejszane przed
            zapisem.
          </p>
          {photoError && (
            <p className="text-xs text-red-400" role="alert">
              {photoError}
            </p>
          )}
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
