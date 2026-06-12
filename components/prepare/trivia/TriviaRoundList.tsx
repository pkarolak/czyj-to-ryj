"use client";

import { Check, HelpCircle, Pencil, Plus, Trash2, GripVertical } from "lucide-react";
import { useCallback, useState } from "react";
import { TriviaRoundEditor } from "@/components/prepare/trivia/TriviaRoundEditor";
import {
  dragReorderClass,
  useDragReorder,
} from "@/components/prepare/useDragReorder";
import { Button } from "@/components/ui/Button";
import { useTournament } from "@/context/TournamentContext";
import { isTriviaRoundReady } from "@/lib/types/tournament";

export function TriviaRoundList() {
  const { tournament, removeTriviaRound, reorderTriviaRounds } = useTournament();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  const onReorder = useCallback(
    (from: number, to: number) => reorderTriviaRounds(from, to),
    [reorderTriviaRounds],
  );
  const { itemState, move, bindRow } = useDragReorder({ onReorder });

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
        <>
          <p className="text-sm text-cream/40">
            Przeciągnij wiersze lub użyj strzałek, aby ustawić kolejność pytań w
            grze.
          </p>
          <ul className="flex flex-col gap-3">
            {tournament.triviaRounds.map((round, index) => {
              const ready = isTriviaRoundReady(round);
              const { isDragging, isDropTarget } = itemState(index);

              return (
                <li
                  key={round.id}
                  {...bindRow(index, round.id)}
                  className={dragReorderClass(
                    isDragging,
                    isDropTarget,
                    "flex items-center gap-3 rounded-xl border bg-white/[0.03] p-4 transition-colors",
                  )}
                >
                  <GripVertical
                    className="h-4 w-4 shrink-0 text-cream/40"
                    aria-hidden
                  />
                  <span className="w-6 text-center text-sm text-cream/40">
                    {index + 1}.
                  </span>
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
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => move(index, -1, tournament.triviaRounds.length)}
                      disabled={index === 0}
                      className="rounded px-2 py-1 text-xs text-cream/50 hover:bg-white/5 disabled:opacity-30"
                      aria-label="Przesuń wyżej"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => move(index, 1, tournament.triviaRounds.length)}
                      disabled={index === tournament.triviaRounds.length - 1}
                      className="rounded px-2 py-1 text-xs text-cream/50 hover:bg-white/5 disabled:opacity-30"
                      aria-label="Przesuń niżej"
                    >
                      ↓
                    </button>
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
        </>
      )}
    </div>
  );
}
