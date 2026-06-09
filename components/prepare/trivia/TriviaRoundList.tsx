"use client";

import { Check, HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { TriviaRoundEditor } from "@/components/prepare/trivia/TriviaRoundEditor";
import { Button } from "@/components/ui/Button";
import { useTournament } from "@/context/TournamentContext";
import { isTriviaRoundReady } from "@/lib/types/tournament";

export function TriviaRoundList() {
  const { tournament, removeTriviaRound } = useTournament();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  if (editingId) {
    const initial =
      editingId === "new"
        ? undefined
        : tournament.triviaRounds.find((r) => r.id === editingId);
    return (
      <TriviaRoundEditor initial={initial} onDone={() => setEditingId(null)} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setEditingId("new")}
        className="self-start"
      >
        <Plus className="h-4 w-4" />
        Dodaj pytanie
      </Button>

      {tournament.triviaRounds.length === 0 ? (
        <p className="text-sm text-cream/40">
          Brak pytań — dodaj pierwsze pytanie trivia.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tournament.triviaRounds.map((round, index) => {
            const ready = isTriviaRoundReady(round);
            return (
              <li
                key={round.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg text-cream">
                    Pytanie {index + 1}
                    <span className="ml-2 text-xs text-cream/40">
                      {round.type === "closed" ? "zamknięte" : "otwarte"}
                    </span>
                    {ready && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-400">
                        <Check className="h-3 w-3" /> Gotowe
                      </span>
                    )}
                  </p>
                  <p className="line-clamp-2 text-sm text-cream/50">{round.question}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingId(round.id)}
                  className="rounded-full p-2 text-cream/40 hover:bg-white/5 hover:text-cream"
                  aria-label="Edytuj"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeTriviaRound(round.id)}
                  className="rounded-full p-2 text-cream/40 hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Usuń"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
