"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Trash2, User } from "lucide-react";
import { CropPreview } from "@/components/crop/CropPreview";
import { PhotoUpload } from "@/components/prepare/PhotoUpload";
import { useTournament } from "@/context/TournamentContext";
import { isRoundAnnotated, isRoundCropped } from "@/lib/types/tournament";

type PhotoListProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function roundStatus(round: ReturnType<typeof useTournament>["tournament"]["faceRounds"][0]) {
  if (!isRoundCropped(round)) return { label: "Do kadrowania", color: "amber" as const };
  if (!isRoundAnnotated(round)) return { label: "Oznacz postać", color: "sky" as const };
  return { label: "Gotowe", color: "emerald" as const };
}

export function PhotoList({ selectedId, onSelect }: PhotoListProps) {
  const { tournament, removeFaceRound } = useTournament();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <AnimatePresence mode="popLayout">
        {tournament.faceRounds.map((round, index) => {
          const status = roundStatus(round);
          const isSelected = selectedId === round.id;

          return (
            <motion.div
              key={round.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                isSelected
                  ? "border-gold bg-gold/10"
                  : "border-white/10 bg-white/[0.03] hover:border-gold/30"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(round.id)}
                className="flex w-full flex-col items-center gap-2"
              >
                <CropPreview
                  previewUrl={round.croppedPreviewUrl ?? round.originalPreviewUrl}
                  size={72}
                />
                <span className="text-xs text-cream/60">Zdjęcie {index + 1}</span>
                {round.personName && (
                  <span className="flex items-center gap-1 text-xs text-cream/80">
                    <User className="h-3 w-3" />
                    {round.personName}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    status.color === "emerald"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : status.color === "sky"
                        ? "bg-sky-500/20 text-sky-400"
                        : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {status.color === "emerald" && <Check className="h-3 w-3" />}
                  {status.label}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeFaceRound(round.id)}
                className="absolute right-2 top-2 rounded-full p-1 text-cream/30 opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                aria-label="Usuń zdjęcie"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <PhotoUpload />
    </div>
  );
}
