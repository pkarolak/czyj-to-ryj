"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRef, useState } from "react";
import { sortTeamsByScore, type ScoreRoom } from "@/lib/types/scoreRoom";

type RoundScoringPanelProps = {
  room: ScoreRoom;
  roundId: string;
  onConfirm: (teamIds: string[]) => Promise<void>;
};

export function RoundScoringPanel({
  room,
  roundId,
  onConfirm,
}: RoundScoringPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(room.scoredRounds?.[roundId] ?? []),
  );
  const saveQueueRef = useRef(Promise.resolve());

  const persistSelection = (next: Set<string>) => {
    const ids = [...next];
    saveQueueRef.current = saveQueueRef.current
      .then(() => onConfirm(ids))
      .catch(() => {});
  };

  const toggle = (teamId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      persistSelection(next);
      return next;
    });
  };

  const teams = sortTeamsByScore(room.teams);

  if (!teams.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 flex flex-wrap justify-center gap-2"
    >
      {teams.map((team) => {
        const isOn = selected.has(team.id);
        return (
          <button
            key={team.id}
            type="button"
            onClick={() => toggle(team.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              isOn
                ? "border-gold/40 bg-gold/10 text-cream"
                : "border-white/10 bg-white/[0.03] text-cream/60 hover:border-white/20 hover:text-cream/80"
            }`}
            aria-pressed={isOn}
            aria-label={`${isOn ? "Odznacz" : "Zaznacz"} ${team.name}`}
          >
            {team.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={team.photoDataUrl}
                alt=""
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-xs text-ink"
                style={{ backgroundColor: team.color }}
              >
                {team.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="max-w-[8rem] truncate">{team.name}</span>
            {isOn && <Check className="h-3.5 w-3.5 shrink-0 text-gold" />}
          </button>
        );
      })}
    </motion.div>
  );
}
