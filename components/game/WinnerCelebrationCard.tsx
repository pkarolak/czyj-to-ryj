"use client";

import { motion } from "framer-motion";
import type { TeamWithId } from "@/lib/types/scoreRoom";

export type WinnerCardVariant = "hero" | "tile";
export type WinnerCardDensity = "comfortable" | "compact" | "dense";

type WinnerCelebrationCardProps = {
  team: TeamWithId;
  variant?: WinnerCardVariant;
  density?: WinnerCardDensity;
};

const densityStyles = {
  comfortable: {
    hero: {
      avatar: "h-28 w-28 text-4xl sm:h-32 sm:w-32 sm:text-5xl",
      name: "text-4xl sm:text-5xl",
      score: "text-6xl sm:text-7xl",
      padding: "px-8 py-10",
    },
    tile: {
      avatar: "h-20 w-20 text-3xl sm:h-24 sm:w-24",
      name: "text-2xl sm:text-3xl",
      score: "text-4xl sm:text-5xl",
      padding: "p-5 sm:p-6",
      captain: true,
    },
  },
  compact: {
    hero: {
      avatar: "h-28 w-28 text-4xl sm:h-32 sm:w-32 sm:text-5xl",
      name: "text-4xl sm:text-5xl",
      score: "text-6xl sm:text-7xl",
      padding: "px-8 py-10",
    },
    tile: {
      avatar: "h-16 w-16 text-2xl sm:h-20 sm:w-20",
      name: "text-lg sm:text-xl",
      score: "text-3xl sm:text-4xl",
      padding: "p-4",
      captain: true,
    },
  },
  dense: {
    hero: {
      avatar: "h-28 w-28 text-4xl sm:h-32 sm:w-32 sm:text-5xl",
      name: "text-4xl sm:text-5xl",
      score: "text-6xl sm:text-7xl",
      padding: "px-8 py-10",
    },
    tile: {
      avatar: "h-12 w-12 text-xl sm:h-14 sm:w-14",
      name: "text-sm sm:text-base",
      score: "text-2xl sm:text-3xl",
      padding: "p-3",
      captain: false,
    },
  },
} as const;

function TeamAvatar({
  team,
  className,
}: {
  team: TeamWithId;
  className: string;
}) {
  if (team.photoDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={team.photoDataUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ring-4 ring-gold/40 ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display text-ink ring-4 ring-gold/40 ${className}`}
      style={{ backgroundColor: team.color }}
    >
      {team.name.charAt(0).toUpperCase()}
    </div>
  );
}

export function WinnerCelebrationCard({
  team,
  variant = "hero",
  density = "comfortable",
}: WinnerCelebrationCardProps) {
  const glowAnimation = {
    boxShadow: [
      "0 0 0 0 rgba(245,197,66,0)",
      "0 0 40px 8px rgba(245,197,66,0.35)",
      "0 0 0 0 rgba(245,197,66,0)",
    ],
  };

  if (variant === "hero") {
    const styles = densityStyles[density].hero;
    return (
      <motion.div
        animate={glowAnimation}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className={`flex flex-col items-center gap-4 rounded-3xl border-2 border-gold/50 bg-gold/10 text-center sm:flex-row sm:text-left ${styles.padding}`}
      >
          <TeamAvatar team={team} className={styles.avatar} />
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-widest text-gold/70">
              Zwycięzca
            </p>
            <p className={`font-display text-gold ${styles.name}`}>
              {team.name}
            </p>
            <p className="text-cream/60">Kapitan: {team.captain}</p>
          </div>
          <p className={`font-display text-gold ${styles.score}`}>
            {team.score}
          </p>
      </motion.div>
    );
  }

  const styles = densityStyles[density].tile;
  return (
    <motion.div
      animate={glowAnimation}
      transition={{ repeat: Infinity, duration: 1.6 }}
      className={`flex h-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-gold/50 bg-gold/10 text-center ${styles.padding}`}
    >
        <TeamAvatar team={team} className={styles.avatar} />
        <div className="min-w-0 w-full">
          <p
            className={`truncate font-display text-gold ${styles.name}`}
            title={team.name}
          >
            {team.name}
          </p>
          {styles.captain && (
            <p className="truncate text-xs text-cream/50 sm:text-sm">
              {team.captain}
            </p>
          )}
        </div>
        <p className={`font-display text-gold ${styles.score}`}>{team.score}</p>
    </motion.div>
  );
}

export function getWinnerDisplayConfig(count: number) {
  if (count <= 1) {
    return {
      gridClass: "mx-auto w-full max-w-3xl grid-cols-1",
      variant: "hero" as const,
      density: "comfortable" as const,
      headerCompact: false,
    };
  }
  if (count === 2) {
    return {
      gridClass: "mx-auto w-full max-w-4xl grid-cols-1 sm:grid-cols-2",
      variant: "tile" as const,
      density: "comfortable" as const,
      headerCompact: false,
    };
  }
  if (count <= 4) {
    return {
      gridClass: "mx-auto w-full max-w-5xl grid-cols-2",
      variant: "tile" as const,
      density: "compact" as const,
      headerCompact: true,
    };
  }
  if (count <= 8) {
    return {
      gridClass:
        "mx-auto w-full max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      variant: "tile" as const,
      density: "compact" as const,
      headerCompact: true,
    };
  }
  return {
    gridClass:
      "mx-auto w-full max-w-6xl grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    variant: "tile" as const,
    density: "dense" as const,
    headerCompact: true,
  };
}
