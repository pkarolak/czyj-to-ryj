"use client";

import { motion } from "framer-motion";
import { sortTeamsByScore, type Team } from "@/lib/types/scoreRoom";

type LeaderboardDisplayProps = {
  teams: Record<string, Team>;
  title?: string;
  compact?: boolean;
  /** @deprecated use hideTopCount */
  hideWinner?: boolean;
  /** Ukryj N drużyn z czołówki (np. wszystkich remisujących zwycięzców). */
  hideTopCount?: number;
};

export function LeaderboardDisplay({
  teams,
  title = "Punktacja",
  compact = false,
  hideWinner = false,
  hideTopCount = 0,
}: LeaderboardDisplayProps) {
  const sorted = sortTeamsByScore(teams);
  const skip = hideTopCount > 0 ? hideTopCount : hideWinner ? 1 : 0;
  const visible = skip > 0 ? sorted.slice(skip) : sorted;

  if (!sorted.length) {
    return (
      <div className="flex h-full items-center justify-center text-cream/40">
        Brak drużyn w sesji
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col ${compact ? "p-6" : "p-8 sm:p-12"}`}
    >
      <h2
        className={`text-center font-display tracking-wide text-gold ${
          compact ? "mb-6 text-4xl" : "mb-10 text-5xl sm:text-6xl"
        }`}
      >
        {title}
      </h2>

      <div
        className={`mx-auto flex w-full flex-col gap-3 ${
          compact ? "max-w-2xl" : "max-w-4xl flex-1 justify-center gap-4"
        }`}
      >
        {visible.map((team, index) => {
          const rank = skip > 0 ? index + skip + 1 : index + 1;
          return (
            <motion.div
              key={team.id}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 sm:px-8 sm:py-5"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: team.color,
              }}
            >
              <span
                className={`shrink-0 font-display text-cream/30 ${
                  compact ? "w-10 text-3xl" : "w-14 text-4xl sm:text-5xl"
                }`}
              >
                {rank}
              </span>

              {team.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={team.photoDataUrl}
                  alt=""
                  className={`shrink-0 rounded-full object-cover ring-2 ring-white/10 ${
                    compact ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20"
                  }`}
                />
              ) : (
                <div
                  className={`flex shrink-0 items-center justify-center rounded-full font-display text-ink ${
                    compact ? "h-12 w-12 text-lg" : "h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl"
                  }`}
                  style={{ backgroundColor: team.color }}
                >
                  {team.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate font-display text-cream ${
                    compact ? "text-2xl" : "text-3xl sm:text-4xl"
                  }`}
                >
                  {team.name}
                </p>
                <p className="truncate text-sm text-cream/50">
                  Kapitan: {team.captain}
                </p>
              </div>

              <span
                className={`shrink-0 font-display text-gold ${
                  compact ? "text-4xl" : "text-5xl sm:text-6xl"
                }`}
              >
                {team.score}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
