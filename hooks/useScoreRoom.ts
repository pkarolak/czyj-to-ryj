"use client";

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  adjustTeamScore,
  addTeam,
  removeTeam,
  scoreRound,
  setCurrentRound,
  setPointsPerCorrect,
  subscribeRoom,
  toggleShowScores,
} from "@/lib/scores/roomService";
import type { ScoreRoom, Team } from "@/lib/types/scoreRoom";

type UseScoreRoomResult = {
  room: ScoreRoom | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  adjustScore: (teamId: string, delta: number) => Promise<void>;
  addTeamToRoom: (team: Team) => Promise<string>;
  removeTeamFromRoom: (teamId: string) => Promise<void>;
  setShowScores: (show: boolean) => Promise<void>;
  recordRoundScore: (
    roundId: string,
    teamIds: string[],
    roundNumber: number,
  ) => Promise<void>;
  updateCurrentRound: (roundNumber: number) => Promise<void>;
  updatePointsPerCorrect: (points: number) => Promise<void>;
};

export function useScoreRoom(roomCode: string | null): UseScoreRoomResult {
  const [room, setRoom] = useState<ScoreRoom | null>(null);
  const [syncedCode, setSyncedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isFirebaseConfigured();
  const shouldSubscribe = Boolean(roomCode && isConfigured);

  useEffect(() => {
    if (!shouldSubscribe || !roomCode) return;

    const unsubscribe = subscribeRoom(
      roomCode,
      (nextRoom) => {
        setSyncedCode(roomCode);
        setRoom(nextRoom);
        if (!nextRoom) {
          setError("Nie znaleziono pokoju o podanym kodzie.");
        } else {
          setError(null);
        }
      },
      (err) => {
        setSyncedCode(roomCode);
        setError(err.message);
      },
    );

    return unsubscribe;
  }, [roomCode, shouldSubscribe]);

  const isLoading = shouldSubscribe && syncedCode !== roomCode;

  const adjustScore = useCallback(
    async (teamId: string, delta: number) => {
      if (!roomCode) return;
      await adjustTeamScore(roomCode, teamId, delta);
    },
    [roomCode],
  );

  const addTeamToRoom = useCallback(
    async (team: Team) => {
      if (!roomCode) throw new Error("Brak kodu pokoju.");
      return addTeam(roomCode, team);
    },
    [roomCode],
  );

  const removeTeamFromRoom = useCallback(
    async (teamId: string) => {
      if (!roomCode) return;
      await removeTeam(roomCode, teamId);
    },
    [roomCode],
  );

  const setShowScores = useCallback(
    async (show: boolean) => {
      if (!roomCode) return;
      await toggleShowScores(roomCode, show);
    },
    [roomCode],
  );

  const recordRoundScore = useCallback(
    async (roundId: string, teamIds: string[], roundNumber: number) => {
      if (!roomCode) return;
      await scoreRound(roomCode, roundId, teamIds, roundNumber);
    },
    [roomCode],
  );

  const updateCurrentRound = useCallback(
    async (roundNumber: number) => {
      if (!roomCode) return;
      await setCurrentRound(roomCode, roundNumber);
    },
    [roomCode],
  );

  const updatePointsPerCorrect = useCallback(
    async (points: number) => {
      if (!roomCode) return;
      await setPointsPerCorrect(roomCode, points);
    },
    [roomCode],
  );

  const effectiveRoom =
    shouldSubscribe && syncedCode === roomCode ? room : null;

  return {
    room: effectiveRoom,
    isLoading,
    isConfigured,
    error: shouldSubscribe ? error : null,
    adjustScore,
    addTeamToRoom,
    removeTeamFromRoom,
    setShowScores,
    recordRoundScore,
    updateCurrentRound,
    updatePointsPerCorrect,
  };
}
