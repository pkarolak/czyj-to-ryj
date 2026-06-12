"use client";

import { GripVertical } from "lucide-react";
import { useCallback } from "react";
import { useTournament } from "@/context/TournamentContext";
import {
  COMPETITION_LABELS,
  type CompetitionId,
} from "@/lib/types/tournament";
import { reorderItems } from "@/lib/utils/reorder";
import {
  dragReorderClass,
  useDragReorder,
} from "@/components/prepare/useDragReorder";

export function ShowOrderEditor() {
  const { tournament, setShowOrder } = useTournament();

  const onReorder = useCallback(
    (from: number, to: number) => {
      setShowOrder(reorderItems(tournament.showOrder, from, to));
    },
    [setShowOrder, tournament.showOrder],
  );
  const { itemState, move, bindRow } = useDragReorder({ onReorder });

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="mb-1 font-display text-lg text-gold">Kolejność show</h2>
      <p className="mb-4 text-sm text-cream/40">
        Ustal kolejność sekcji. Przeciągnij wiersze lub użyj strzałek — w grze
        najpierw lecą wszystkie rundy z pierwszej sekcji, potem z drugiej itd.
      </p>
      <ul className="flex flex-col gap-2">
        {tournament.showOrder.map((section, index) => {
          const { isDragging, isDropTarget } = itemState(index);

          return (
            <li
              key={section}
              {...bindRow(index, section)}
              className={dragReorderClass(
                isDragging,
                isDropTarget,
                "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
              )}
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
                  onClick={() => move(index, -1, tournament.showOrder.length)}
                  disabled={index === 0}
                  className="rounded px-2 py-1 text-xs text-cream/50 hover:bg-white/5 disabled:opacity-30"
                  aria-label={`Przesuń ${COMPETITION_LABELS[section as CompetitionId]} wyżej`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => move(index, 1, tournament.showOrder.length)}
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
