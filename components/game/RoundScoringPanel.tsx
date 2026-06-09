"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sortTeamsByScore, type ScoreRoom } from "@/lib/types/scoreRoom";

type RoundScoringPanelProps = {
  room: ScoreRoom;
  roundId: string;
  roundNumber: number;
  onConfirm: (teamIds: string[]) => Promise<void>;
  onSkip: () => void;
};

export function RoundScoringPanel({
  room,
  roundId,
  roundNumber,
  onConfirm,
  onSkip,
}: RoundScoringPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(room.scoredRounds?.[roundId] ?? []),
  );
  const [isSaving, setIsSaving] = useState(false);

  const teams = sortTeamsByScore(room.teams);

  const toggle = (teamId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await onConfirm([...selected]);
    } finally {
      setIsSaving(false);
    }
  };

  if (!teams.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 w-full max-w-2xl"
    >
      <p className="mb-3 text-center text-sm uppercase tracking-widest text-gold/70">
        Kto zgadł? — Runda {roundNumber}
      </p>
      <p className="mb-4 text-center text-xs text-cream/40">
        +{room.pointsPerCorrect} pkt za każdą zaznaczoną drużynę
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {teams.map((team) => {
          const isOn = selected.has(team.id);
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => toggle(team.id)}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                isOn
                  ? "border-gold bg-gold/15"
                  : "border-white/10 bg-white/[0.03] hover:border-gold/30"
              }`}
            >
              {isOn && (
                <span className="absolute right-2 top-2 text-gold">
                  <Check className="h-4 w-4" />
                </span>
              )}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full font-display text-lg text-ink"
                style={{ backgroundColor: team.color }}
              >
                {team.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-center text-sm text-cream">{team.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Pomiń
        </Button>
        <Button size="sm" onClick={handleConfirm} disabled={isSaving}>
          {isSaving ? "Zapisuję…" : "Zapisz punkty"}
        </Button>
      </div>
    </motion.div>
  );
}
