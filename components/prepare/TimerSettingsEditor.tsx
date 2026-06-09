"use client";

import { useTournament } from "@/context/TournamentContext";
import {
  COMPETITION_LABELS,
  DEFAULT_TIMER_SECONDS,
  MAX_TIMER_SECONDS,
  MIN_TIMER_SECONDS,
  type CompetitionId,
} from "@/lib/types/tournament";

const CATEGORIES: CompetitionId[] = ["face", "harmony", "trivia"];

export function TimerSettingsEditor() {
  const { tournament, setTimerSeconds } = useTournament();

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="mb-1 font-display text-lg text-gold">Czas na odpowiedź</h2>
      <p className="mb-4 text-sm text-cream/40">
        Ustaw limit czasu (w sekundach) dla każdej kategorii. Timer pojawi się na
        rzutniku podczas gry.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {CATEGORIES.map((category) => (
          <label
            key={category}
            className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-3"
          >
            <span className="text-sm text-cream/70">
              {COMPETITION_LABELS[category]}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={MIN_TIMER_SECONDS}
                max={MAX_TIMER_SECONDS}
                value={
                  tournament.timerSeconds?.[category] ??
                  DEFAULT_TIMER_SECONDS[category]
                }
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  if (!Number.isFinite(raw)) return;
                  const clamped = Math.min(
                    MAX_TIMER_SECONDS,
                    Math.max(MIN_TIMER_SECONDS, Math.round(raw)),
                  );
                  setTimerSeconds(category, clamped);
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-display text-xl text-gold outline-none focus:border-gold/50"
              />
              <span className="text-sm text-cream/40">s</span>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
