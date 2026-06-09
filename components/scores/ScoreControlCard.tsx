"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { TeamWithId } from "@/lib/types/scoreRoom";

type ScoreControlCardProps = {
  team: TeamWithId;
  onAdjust: (delta: number) => void;
  onRemove?: () => void;
};

export function ScoreControlCard({
  team,
  onAdjust,
  onRemove,
}: ScoreControlCardProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
      style={{ borderLeftWidth: 4, borderLeftColor: team.color }}
    >
      {team.photoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.photoDataUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg text-ink"
          style={{ backgroundColor: team.color }}
        >
          {team.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg text-cream">{team.name}</p>
        <p className="truncate text-xs text-cream/50">{team.captain}</p>
      </div>

      <span className="w-10 text-center font-display text-2xl text-gold">
        {team.score}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onAdjust(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cream transition-colors active:bg-white/10"
          aria-label={`Odejmij punkt ${team.name}`}
        >
          <Minus className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => onAdjust(1)}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 text-gold transition-colors active:bg-gold/25"
          aria-label={`Dodaj punkt ${team.name}`}
        >
          <Plus className="h-6 w-6" />
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 transition-colors active:bg-red-500/20"
            aria-label={`Usuń drużynę ${team.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
