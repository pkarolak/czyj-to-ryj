"use client";

import { GripVertical } from "lucide-react";
import { useState } from "react";
import { useTournament } from "@/context/TournamentContext";
import {
  COMPETITION_LABELS,
  type CompetitionId,
} from "@/lib/types/tournament";

function reorderSections(
  order: CompetitionId[],
  from: number,
  to: number,
): CompetitionId[] {
  const next = [...order];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function ShowOrderEditor() {
  const { tournament, setShowOrder } = useTournament();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= tournament.showOrder.length) return;
    setShowOrder(reorderSections(tournament.showOrder, index, target));
  };

  const finishDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      finishDrag();
      return;
    }
    setShowOrder(reorderSections(tournament.showOrder, dragIndex, targetIndex));
    finishDrag();
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="mb-1 font-display text-lg text-gold">Kolejność show</h2>
      <p className="mb-4 text-sm text-cream/40">
        Ustal kolejność sekcji. Przeciągnij wiersze lub użyj strzałek — w grze
        najpierw lecą wszystkie rundy z pierwszej sekcji, potem z drugiej itd.
      </p>
      <ul className="flex flex-col gap-2">
        {tournament.showOrder.map((section, index) => {
          const isDragging = dragIndex === index;
          const isDropTarget =
            overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <li
              key={section}
              draggable
              onDragStart={(event) => {
                setDragIndex(index);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", section);
              }}
              onDragEnd={finishDrag}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragIndex !== null && dragIndex !== index) {
                  setOverIndex(index);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(index);
              }}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                isDragging
                  ? "cursor-grabbing border-gold/30 bg-gold/5 opacity-50"
                  : isDropTarget
                    ? "border-gold/50 bg-gold/10"
                    : "cursor-grab border-white/10 bg-white/[0.02]"
              }`}
            >
              <GripVertical
                className="h-4 w-4 shrink-0 text-cream/40"
                aria-hidden
              />
              <span className="w-6 text-center text-sm text-cream/40">
                {index + 1}.
              </span>
              <span className="flex-1 text-cream">
                {COMPETITION_LABELS[section as CompetitionId]}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded px-2 py-1 text-xs text-cream/50 hover:bg-white/5 disabled:opacity-30"
                  aria-label={`Przesuń ${COMPETITION_LABELS[section as CompetitionId]} wyżej`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => move(index, 1)}
                  disabled={index === tournament.showOrder.length - 1}
                  className="rounded px-2 py-1 text-xs text-cream/50 hover:bg-white/5 disabled:opacity-30"
                  aria-label={`Przesuń ${COMPETITION_LABELS[section as CompetitionId]} niżej`}
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
