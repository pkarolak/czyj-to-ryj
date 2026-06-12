"use client";

import { Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { sortTeamsByScore, type Team } from "@/lib/types/scoreRoom";

type TeamRosterProps = {
  teams: Record<string, Team> | null | undefined;
  showScores?: boolean;
  emptyLabel?: string;
  onEditTeam?: (teamId: string) => void;
};

export function TeamRoster({
  teams,
  showScores = false,
  emptyLabel = "Brak drużyn — dodaj z telefonu lub poniżej.",
  onEditTeam,
}: TeamRosterProps) {
  const sorted = sortTeamsByScore(teams);

  if (!sorted.length) {
    return (
      <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-cream/40">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((team) => (
        <motion.li
          key={team.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
          style={{ borderLeftWidth: 4, borderLeftColor: team.color }}
        >
          {team.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={team.photoDataUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm text-ink"
              style={{ backgroundColor: team.color }}
            >
              {team.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg text-cream">{team.name}</p>
            <p className="truncate text-xs text-cream/50">Kapitan: {team.captain}</p>
          </div>
          {showScores && (
            <span className="shrink-0 font-display text-xl text-gold">{team.score}</span>
          )}
          {onEditTeam && (
            <button
              type="button"
              onClick={() => onEditTeam(team.id)}
              className="flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-cream/70 transition-colors hover:bg-white/10 hover:text-cream active:scale-95 sm:px-3.5"
              aria-label={`Edytuj drużynę ${team.name}`}
            >
              <Pencil className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Edytuj</span>
            </button>
          )}
        </motion.li>
      ))}
    </ul>
  );
}
