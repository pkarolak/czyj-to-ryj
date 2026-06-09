"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTournament } from "@/context/TournamentContext";
import {
  resizeTeamPhotoToDataUrl,
  TEAM_PHOTO_MAX_INPUT_BYTES,
} from "@/lib/images/resizeTeamPhoto";
import { isTriviaRoundReady, type TriviaRound, type TriviaRoundType } from "@/lib/types/tournament";

type TriviaRoundEditorProps = {
  initial?: TriviaRound;
  onDone: () => void;
};

const OPTION_LABELS = ["A", "B", "C", "D"];

export function TriviaRoundEditor({ initial, onDone }: TriviaRoundEditorProps) {
  const { addTriviaRound, updateTriviaRound } = useTournament();
  const [type, setType] = useState<TriviaRoundType>(initial?.type ?? "closed");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [options, setOptions] = useState<string[]>(
    initial?.options ?? ["", "", "", ""],
  );
  const [correctAnswer, setCorrectAnswer] = useState(initial?.correctAnswer ?? "");
  const [openAnswer, setOpenAnswer] = useState(
    initial?.type === "open" ? initial.correctAnswer : "",
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.imagePreviewUrl ?? null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await resizeTeamPhotoToDataUrl(file);
      setImagePreview(dataUrl);
      setImageFile(file);
      setRemoveImage(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać zdjęcia.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedOptions =
      type === "closed"
        ? options.map((o) => o.trim()).filter(Boolean)
        : null;
    const answer = type === "closed" ? correctAnswer.trim() : openAnswer.trim();

    const draft = {
      type,
      question: question.trim(),
      options: type === "closed" ? trimmedOptions : null,
      correctAnswer: answer,
    };

    if (!isTriviaRoundReady({ id: "", imageBlob: null, imagePreviewUrl: null, ...draft })) {
      setError("Uzupełnij pytanie i poprawną odpowiedź (dla zamkniętego min. 2 opcje).");
      return;
    }

    setIsSaving(true);
    try {
      if (initial) {
        await updateTriviaRound(
          initial.id,
          draft,
          imageFile,
          removeImage,
        );
      } else {
        await addTriviaRound(draft, imageFile);
      }
      onDone();
    } finally {
      setIsSaving(false);
    }
  };

  const maxMb = Math.round(TEAM_PHOTO_MAX_INPUT_BYTES / 1024 / 1024);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <h3 className="mb-4 font-display text-xl text-gold">
        {initial ? "Edytuj pytanie" : "Nowe pytanie — Taki jesteś mądry?"}
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {(["closed", "open"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                type === t
                  ? "bg-gold/20 text-gold"
                  : "bg-white/5 text-cream/50 hover:text-cream"
              }`}
            >
              {t === "closed" ? "Zamknięte" : "Otwarte"}
            </button>
          ))}
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Treść pytania"
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-cream outline-none focus:border-gold/50"
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? "Zmień zdjęcie" : "Zdjęcie pomocnicze (opcja)"}
            </Button>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setRemoveImage(true);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="text-xs text-cream/40 underline"
              >
                Usuń zdjęcie
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleImage(e.target.files?.[0])}
            />
          </div>
          <p className="text-xs text-cream/40">Do {maxMb} MB — automatycznie zmniejszane.</p>
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt=""
              className="max-h-40 rounded-lg object-contain"
            />
          )}
        </div>

        {type === "closed" ? (
          <div className="flex flex-col gap-2">
            {OPTION_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-6 text-sm text-gold">{label}</span>
                <input
                  type="text"
                  value={options[i] ?? ""}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                  placeholder={`Odpowiedź ${label}`}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-cream outline-none focus:border-gold/50"
                />
                <input
                  type="radio"
                  name="correct"
                  checked={correctAnswer === options[i]?.trim() && !!options[i]?.trim()}
                  onChange={() => setCorrectAnswer(options[i]?.trim() ?? "")}
                  className="accent-gold"
                  aria-label={`Poprawna: ${label}`}
                />
              </div>
            ))}
            <p className="text-xs text-cream/40">
              Zaznacz kółko przy poprawnej odpowiedzi.
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm text-cream/60">
              Poprawna odpowiedź
            </label>
            <input
              type="text"
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              placeholder="Tekst poprawnej odpowiedzi"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-cream outline-none focus:border-gold/50"
            />
          </div>
        )}

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
            {isSaving ? "Zapisywanie…" : initial ? "Zapisz" : "Dodaj pytanie"}
          </Button>
        </div>
      </div>
    </form>
  );
}
