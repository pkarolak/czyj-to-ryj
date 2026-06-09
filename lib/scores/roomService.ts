import {
  get,
  onValue,
  ref,
  runTransaction,
  set,
  update,
  type Unsubscribe,
} from "firebase/database";
import { getFirebaseDatabase, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  isValidRoomCode,
  normalizeScoreRoom,
  type ScoreRoom,
  type Team,
} from "@/lib/types/scoreRoom";

function roomRef(roomCode: string) {
  return ref(getFirebaseDatabase(), `rooms/${roomCode}`);
}

function emptyRoom(roomCode: string): ScoreRoom {
  return {
    roomCode,
    showScores: false,
    currentRound: 1,
    pointsPerCorrect: 1,
    teams: {},
    scoredRounds: {},
    createdAt: Date.now(),
  };
}

export function generateRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function roomExists(roomCode: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !isValidRoomCode(roomCode)) return false;
  const snapshot = await get(roomRef(roomCode));
  return snapshot.exists();
}

export async function createRoom(preferredCode?: string): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase nie jest skonfigurowany.");
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    const code = preferredCode && attempt === 0 ? preferredCode : generateRoomCode();
    if (!isValidRoomCode(code)) continue;

    const exists = await roomExists(code);
    if (exists) {
      if (preferredCode) {
        throw new Error(`Pokój ${code} już istnieje.`);
      }
      continue;
    }

    await set(roomRef(code), emptyRoom(code));
    return code;
  }

  throw new Error("Nie udało się wygenerować unikalnego kodu pokoju.");
}

export function subscribeRoom(
  roomCode: string,
  onChange: (room: ScoreRoom | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!isFirebaseConfigured() || !isValidRoomCode(roomCode)) {
    onChange(null);
    return () => {};
  }

  return onValue(
    roomRef(roomCode),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      onChange(normalizeScoreRoom(snapshot.val(), roomCode));
    },
    (error) => onError?.(error),
  );
}

export async function addTeam(
  roomCode: string,
  team: Team,
): Promise<string> {
  const teamId = crypto.randomUUID();
  await update(roomRef(roomCode), {
    [`teams/${teamId}`]: team,
  });
  return teamId;
}

export async function adjustTeamScore(
  roomCode: string,
  teamId: string,
  delta: number,
): Promise<void> {
  const teamScoreRef = ref(getFirebaseDatabase(), `rooms/${roomCode}/teams/${teamId}/score`);
  await runTransaction(teamScoreRef, (current) => {
    const value = typeof current === "number" ? current : 0;
    return Math.max(0, value + delta);
  });
}

export async function toggleShowScores(
  roomCode: string,
  show: boolean,
): Promise<void> {
  await update(roomRef(roomCode), { showScores: show });
}

export async function setCurrentRound(
  roomCode: string,
  currentRound: number,
): Promise<void> {
  await update(roomRef(roomCode), { currentRound });
}

export async function setPointsPerCorrect(
  roomCode: string,
  pointsPerCorrect: number,
): Promise<void> {
  await update(roomRef(roomCode), {
    pointsPerCorrect: Math.max(1, pointsPerCorrect),
  });
}

/**
 * Idempotentne naliczanie punktów za rundę.
 * Przy ponownym wywołaniu z innym zestawem drużyn cofa poprzednie i nalicza nowe.
 */
export async function scoreRound(
  roomCode: string,
  roundId: string,
  teamIds: string[],
  roundNumber: number,
): Promise<void> {
  const baseRef = roomRef(roomCode);

  await runTransaction(baseRef, (room) => {
    if (!room) return room;

    const data = room as ScoreRoom;
    const previousTeamIds = data.scoredRounds?.[roundId] ?? [];
    const points = data.pointsPerCorrect ?? 1;
    const teams = { ...(data.teams ?? {}) };

    for (const id of previousTeamIds) {
      if (teams[id]) {
        teams[id] = {
          ...teams[id],
          score: Math.max(0, teams[id].score - points),
        };
      }
    }

    for (const id of teamIds) {
      if (teams[id]) {
        teams[id] = {
          ...teams[id],
          score: teams[id].score + points,
        };
      }
    }

    return {
      ...data,
      teams,
      currentRound: roundNumber,
      scoredRounds: {
        ...(data.scoredRounds ?? {}),
        [roundId]: teamIds,
      },
    };
  });
}

export function getStoredRoomCode(): string | null {
  if (typeof window === "undefined") return null;
  const code = localStorage.getItem("scoreRoomCode");
  return code && isValidRoomCode(code) ? code : null;
}

export function storeRoomCode(code: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("scoreRoomCode", code);
}

export function clearStoredRoomCode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("scoreRoomCode");
}
