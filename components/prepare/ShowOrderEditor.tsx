"use client";

import { GripVertical } from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import {
  COMPETITION_LABELS,
  type CompetitionId,
} from "@/lib/types/tournament";

export function ShowOrderEditor() {
  const { tournament, setShowOrder } = useTournament();

  const move = (index: number, direction: -1 | 1) => {
    const next = [...tournament.showOrder];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setShowOrder(next);
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="mb-1 font-display text-lg text-gold">Kolejność show</h2>
      <p className="mb-4 text-sm text-cream/40">
        Ustal kolejność sekcji. W grze odtwarzane są wszystkie rundy z pierwszej
        sekcji, potem z drugiej itd.
      </p>
      <ul className="flex flex-col gap-2">
        {tournament.showOrder.map((section, index) => (
          <li
            key={section}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-cream/30" />
            <span className="w-6 text-center text-sm text-cream/40">
              {index + 1}.
            </span>
            <span className="flex-1 text-cream">
              {COMPETITION_LABELS[section as CompetitionId]}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded px-2 py-1 text-xs text-cream/50 hover:bg-white/5 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === tournament.showOrder.length - 1}
                className="rounded px-2 py-1 text-xs text-cream/50 hover:bg-white/5 disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
