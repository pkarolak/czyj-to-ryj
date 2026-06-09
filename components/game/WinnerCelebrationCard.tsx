"use client";

import { motion } from "framer-motion";
import type { TeamWithId } from "@/lib/types/scoreRoom";

type WinnerCelebrationCardProps = {
  team: TeamWithId;
  compact?: boolean;
};

export function WinnerCelebrationCard({
  team,
  compact = false,
}: WinnerCelebrationCardProps) {
  const avatarSize = compact
    ? "h-20 w-20 text-3xl sm:h-24 sm:w-24 sm:text-4xl"
    : "h-28 w-28 text-4xl sm:h-32 sm:w-32 sm:text-5xl";
  const nameSize = compact
    ? "text-3xl sm:text-4xl"
    : "text-4xl sm:text-5xl";
  const scoreSize = compact ? "text-5xl sm:text-6xl" : "text-6xl sm:text-7xl";

  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(245,197,66,0)",
          "0 0 40px 8px rgba(245,197,66,0.35)",
          "0 0 0 0 rgba(245,197,66,0)",
        ],
      }}
      transition={{ repeat: Infinity, duration: 1.6 }}
      className={`flex flex-col items-center gap-4 rounded-3xl border-2 border-gold/50 bg-gold/10 text-center sm:flex-row sm:text-left ${
        compact ? "px-6 py-6" : "px-8 py-10"
      }`}
    >
      {team.photoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.photoDataUrl}
          alt=""
          className={`shrink-0 rounded-full object-cover ring-4 ring-gold/40 ${avatarSize}`}
        />
      ) : (
        <div
          className={`flex shrink-0 items-center justify-center rounded-full font-display text-ink ring-4 ring-gold/40 ${avatarSize}`}
          style={{ backgroundColor: team.color }}
        >
          {team.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`font-display text-gold ${nameSize}`}>{team.name}</p>
        <p className="text-cream/60">Kapitan: {team.captain}</p>
      </div>
      <p className={`font-display text-gold ${scoreSize}`}>{team.score}</p>
    </motion.div>
  );
}
