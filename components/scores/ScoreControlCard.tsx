"use client";

import { Minus, Pencil, Plus } from "lucide-react";
import type { TeamWithId } from "@/lib/types/scoreRoom";

type ScoreControlCardProps = {
  team: TeamWithId;
  onAdjust: (delta: number) => void;
  onEdit?: () => void;
};

export function ScoreControlCard({
  team,
  onAdjust,
  onEdit,
}: ScoreControlCardProps) {
  const avatar = team.photoDataUrl ? (
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
  );

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
      style={{ borderLeftWidth: 4, borderLeftColor: team.color }}
    >
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded-full ring-offset-2 ring-offset-transparent transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          aria-label={`Edytuj drużynę ${team.name}`}
        >
          {avatar}
        </button>
      ) : (
        avatar
      )}

      <button
        type="button"
        onClick={onEdit}
        disabled={!onEdit}
        className="min-w-0 flex-1 text-left disabled:cursor-default"
      >
        <p className="truncate font-display text-lg text-cream">{team.name}</p>
        <p className="truncate text-xs text-cream/50">{team.captain}</p>
      </button>

      <span className="w-10 shrink-0 text-center font-display text-2xl text-gold">
        {team.score}
      </span>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cream/70 transition-colors hover:bg-white/10 hover:text-cream active:scale-95"
          aria-label={`Edytuj drużynę ${team.name}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

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
      </div>
    </div>
  );
}
