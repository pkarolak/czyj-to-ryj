"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { CropPreview } from "@/components/crop/CropPreview";
import { useTournament } from "@/context/TournamentContext";
import { isRoundCropped } from "@/lib/types/tournament";

type PhotoListProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function PhotoList({ selectedId, onSelect }: PhotoListProps) {
  const { tournament, removeRound } = useTournament();

  if (!tournament.rounds.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <AnimatePresence mode="popLayout">
        {tournament.rounds.map((round, index) => {
          const cropped = isRoundCropped(round);
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
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    cropped
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {cropped ? (
                    <>
                      <Check className="h-3 w-3" /> Gotowe
                    </>
                  ) : (
                    "Do kadrowania"
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeRound(round.id)}
                className="absolute right-2 top-2 rounded-full p-1 text-cream/30 opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                aria-label="Usuń zdjęcie"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
