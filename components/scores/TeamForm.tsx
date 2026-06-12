"use client";

import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  resizeTeamPhotoToDataUrl,
  TEAM_PHOTO_MAX_INPUT_BYTES,
} from "@/lib/images/resizeTeamPhoto";
import { TEAM_COLORS, type Team, type TeamWithId } from "@/lib/types/scoreRoom";

type TeamFormProps = {
  onSubmit: (team: Team) => Promise<void>;
  teamCount?: number;
  initialTeam?: TeamWithId;
  onCancel?: () => void;
  onDelete?: () => void;
};

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-base text-cream outline-none focus:border-gold/50 sm:py-2.5 sm:text-sm";

export function TeamForm({
  onSubmit,
  teamCount = 0,
  initialTeam,
  onCancel,
  onDelete,
}: TeamFormProps) {
  const isEditing = Boolean(initialTeam);
  const [name, setName] = useState(initialTeam?.name ?? "");
  const [captain, setCaptain] = useState(initialTeam?.captain ?? "");
  const [color, setColor] = useState(
    initialTeam?.color ?? TEAM_COLORS[teamCount % TEAM_COLORS.length],
  );
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(
    initialTeam?.photoDataUrl ?? null,
  );
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
      await onSubmit({
        name: name.trim(),
        captain: captain.trim(),
        score: initialTeam?.score ?? 0,
        color,
        photoDataUrl,
      });

      if (!isEditing) {
        setName("");
        setCaptain("");
        setPhotoDataUrl(null);
        setPhotoError(null);
        setColor(TEAM_COLORS[(teamCount + 1) % TEAM_COLORS.length]);
        if (fileRef.current) fileRef.current.value = "";
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxMb = Math.round(TEAM_PHOTO_MAX_INPUT_BYTES / 1024 / 1024);

  const avatarPreview = photoDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoDataUrl}
      alt=""
      className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white/10"
    />
  ) : (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-2xl text-ink ring-2 ring-white/10"
      style={{ backgroundColor: color }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 id="team-edit-title" className="font-display text-xl text-gold">
          {isEditing ? "Edytuj drużynę" : "Dodaj drużynę"}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-10 px-2 text-sm text-cream/40 underline"
          >
            Anuluj
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-cream/60">Nazwa drużyny</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Ryjowi Mistrzowie"
            autoComplete="off"
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-cream/60">Kapitan</span>
          <input
            type="text"
            value={captain}
            onChange={(e) => setCaptain(e.target.value)}
            placeholder="Imię i nazwisko"
            autoComplete="name"
            className={inputClassName}
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm text-cream/60">Kolor drużyny</legend>
          <div className="flex flex-wrap gap-2.5">
            {TEAM_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-10 w-10 rounded-full ring-2 transition-transform sm:h-8 sm:w-8 ${
                  color === c ? "scale-110 ring-gold" : "ring-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Kolor ${c}`}
                aria-pressed={color === c}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-3">
          <span className="text-sm text-cream/60">Zdjęcie drużyny (opcjonalnie)</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {avatarPreview}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isProcessingPhoto}
                  onClick={() => fileRef.current?.click()}
                  className="min-h-10"
                >
                  {isProcessingPhoto
                    ? "Przetwarzanie…"
                    : photoDataUrl
                      ? "Zmień zdjęcie"
                      : "Dodaj zdjęcie"}
                </Button>
                {photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoDataUrl(null);
                      setPhotoError(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="min-h-10 px-2 text-xs text-cream/40 underline"
                  >
                    Usuń zdjęcie
                  </button>
                )}
              </div>
              <p className="text-xs text-cream/40">
                Do {maxMb} MB — automatycznie zmniejszane przed zapisem. Na
                telefonie możesz zrobić zdjęcie aparatem.
              </p>
              {photoError && (
                <p className="text-xs text-red-400" role="alert">
                  {photoError}
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
        </div>

        {isEditing && (
          <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-cream/50">
            Wynik drużyny:{" "}
            <span className="font-display text-gold">{initialTeam?.score ?? 0}</span>{" "}
            pkt — zmieniasz w panelu punktacji podczas gry.
          </p>
        )}

        <Button
          type="submit"
          disabled={!name.trim() || !captain.trim() || isSubmitting}
          className="min-h-12 w-full sm:min-h-10"
        >
          {isSubmitting
            ? isEditing
              ? "Zapisywanie…"
              : "Dodawanie…"
            : isEditing
              ? "Zapisz zmiany"
              : "Dodaj drużynę"}
        </Button>

        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            className="min-h-12 w-full text-red-400 hover:text-red-300 sm:min-h-10"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Usuń drużynę
          </Button>
        )}
      </div>
    </form>
  );
}
