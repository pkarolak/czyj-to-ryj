"use client";

import Link from "next/link";
import { Copy, Smartphone, Trophy, Wifi } from "lucide-react";
import { useState } from "react";
import { FirebaseNotice } from "@/components/scores/FirebaseNotice";
import { TeamEditSheet } from "@/components/scores/TeamEditSheet";
import { TeamForm } from "@/components/scores/TeamForm";
import { TeamRoster } from "@/components/scores/TeamRoster";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useScoreRoom } from "@/hooks/useScoreRoom";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  createRoom,
  getStoredRoomCode,
  storeRoomCode,
} from "@/lib/scores/roomService";
import { sortTeamsByScore } from "@/lib/types/scoreRoom";

export function ScoreSessionPanel() {
  const [roomCode, setRoomCode] = useState<string | null>(() =>
    getStoredRoomCode(),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const isConfigured = isFirebaseConfigured();

  const {
    room,
    isLoading,
    addTeamToRoom,
    removeTeamFromRoom,
    updateTeamInRoom,
  } = useScoreRoom(roomCode);
  const teamCount = Object.keys(room?.teams ?? {}).length;
  const teams = sortTeamsByScore(room?.teams);
  const editingTeam = editingTeamId
    ? teams.find((team) => team.id === editingTeamId)
    : null;

  const handleCreate = async () => {
    setIsCreating(true);
    setMessage(null);
    try {
      const code = await createRoom();
      storeRoomCode(code);
      setRoomCode(code);
      setMessage(`Sesja utworzona. Kod: ${code}`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setMessage(
        raw.toLowerCase().includes("permission")
          ? "Permission denied — wgraj reguły RTDB w Firebase Console (Rules → Publish). Zobacz firebase.database.rules.json w projekcie."
          : raw || "Nie udało się utworzyć sesji.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = async () => {
    if (!roomCode) return;
    await navigator.clipboard.writeText(roomCode);
    setMessage("Kod skopiowany.");
  };

  if (!isConfigured) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 font-display text-2xl text-gold">
          Zarządzanie sesją punktacji
        </h2>
        <FirebaseNotice />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="mb-2 font-display text-2xl text-gold">
        Zarządzanie sesją punktacji
      </h2>
      <p className="mb-6 text-sm text-cream/50">
        Utwórz kod pokoju dla telefonu prowadzącego. Drużyny dodane na telefonie
        lub tutaj synchronizują się na żywo.
      </p>

      {!roomCode ? (
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? "Tworzenie…" : "Utwórz sesję punktacji"}
        </Button>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-cream/40">
                Kod pokoju
              </p>
              <p className="font-display text-5xl text-gold">{roomCode}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={copyCode}>
              <Copy className="h-4 w-4" />
              Kopiuj
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/remote?room=${roomCode}`}>
              <Button variant="secondary" size="sm">
                <Smartphone className="h-4 w-4" />
                Panel mobilny
              </Button>
            </Link>
            <Link href={`/scores?room=${roomCode}`} target="_blank">
              <Button variant="secondary" size="sm">
                <Trophy className="h-4 w-4" />
                Tabela wyników
              </Button>
            </Link>
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-xl text-cream/80">
                Drużyny{teamCount > 0 ? ` (${teamCount})` : ""}
              </h3>
              {room && !isLoading && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400/80">
                  <Wifi className="h-3.5 w-3.5" />
                  Na żywo
                </span>
              )}
            </div>

            {isLoading && !room ? (
              <p className="text-sm text-cream/40">Łączenie z sesją…</p>
            ) : (
              <TeamRoster
                teams={room?.teams}
                showScores
                onEditTeam={setEditingTeamId}
                emptyLabel="Brak drużyn — dodaj z telefonu lub formularza poniżej."
              />
            )}
          </section>

          {room && (
            <TeamForm
              teamCount={teamCount}
              onSubmit={async (team) => {
                await addTeamToRoom(team);
              }}
            />
          )}

          {editingTeam && (
            <TeamEditSheet
              team={editingTeam}
              onClose={() => setEditingTeamId(null)}
              onSave={async (team) => {
                await updateTeamInRoom(editingTeam.id, team);
                setEditingTeamId(null);
                setMessage(`Zapisano zmiany: ${team.name}`);
              }}
              onDelete={() => {
                if (
                  confirm(
                    `Usunąć drużynę „${editingTeam.name}"? Tej operacji nie można cofnąć.`,
                  )
                ) {
                  void removeTeamFromRoom(editingTeam.id);
                  setEditingTeamId(null);
                  setMessage("Drużyna usunięta.");
                }
              }}
            />
          )}
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm text-gold/80" role="status">
          {message}
        </p>
      )}
    </Card>
  );
}
