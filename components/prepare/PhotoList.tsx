"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, GripVertical, Trash2, User } from "lucide-react";
import { useCallback } from "react";
import { CropPreview } from "@/components/crop/CropPreview";
import { PhotoUpload } from "@/components/prepare/PhotoUpload";
import {
  dragReorderClass,
  useDragReorder,
} from "@/components/prepare/useDragReorder";
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
  const { tournament, removeFaceRound, reorderFaceRounds } = useTournament();

  const onReorder = useCallback(
    (from: number, to: number) => reorderFaceRounds(from, to),
    [reorderFaceRounds],
  );
  const { itemState, move, bindDragHandle, bindDropTarget } = useDragReorder({
    onReorder,
  });

  return (
    <div className="flex flex-col gap-3">
      {tournament.faceRounds.length > 1 && (
        <p className="text-sm text-cream/40">
          Przeciągnij kafelki za uchwyt lub użyj strzałek, aby ustawić kolejność
          zdjęć w grze.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {tournament.faceRounds.map((round, index) => {
            const status = roundStatus(round);
            const isSelected = selectedId === round.id;
            const { isDragging, isDropTarget } = itemState(index);
            const canReorder = tournament.faceRounds.length > 1;

            return (
              <motion.div
                key={round.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                {...bindDropTarget(index)}
                className={`group relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                  isSelected
                    ? "border-gold bg-gold/10"
                    : dragReorderClass(
                        isDragging,
                        isDropTarget,
                        "border-white/10 bg-white/[0.03] hover:border-gold/30",
                      )
                }`}
              >
                {canReorder && (
                  <div
                    {...bindDragHandle(index, round.id)}
                    className="absolute left-1.5 top-1.5 z-10 cursor-grab rounded p-0.5 text-cream/40 hover:bg-white/10 hover:text-cream/70 active:cursor-grabbing"
                    aria-label={`Przeciągnij zdjęcie ${index + 1}`}
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}
                {canReorder && (
                  <div className="absolute right-1.5 top-1.5 z-10 flex gap-0.5">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => move(index, -1, tournament.faceRounds.length)}
                      disabled={index === 0}
                      className="rounded px-1 py-0.5 text-[10px] text-cream/40 hover:bg-white/10 disabled:opacity-30"
                      aria-label="Przesuń wcześniej"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => move(index, 1, tournament.faceRounds.length)}
                      disabled={index === tournament.faceRounds.length - 1}
                      className="rounded px-1 py-0.5 text-[10px] text-cream/40 hover:bg-white/10 disabled:opacity-30"
                      aria-label="Przesuń później"
                    >
                      →
                    </button>
                  </div>
                )}
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
                  className="absolute bottom-2 right-2 rounded-full p-1 text-cream/30 opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
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
    </div>
  );
}
