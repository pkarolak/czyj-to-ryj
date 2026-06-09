export type Team = {
  name: string;
  captain: string;
  score: number;
  color: string;
  photoDataUrl: string | null;
};

export type ScoreRoom = {
  roomCode: string;
  showScores: boolean;
  currentRound: number;
  pointsPerCorrect: number;
  teams: Record<string, Team>;
  scoredRounds: Record<string, string[]>;
  createdAt: number;
};

export type TeamWithId = Team & { id: string };

export const TEAM_COLORS = [
  "#f5c542",
  "#e85d75",
  "#4ecdc4",
  "#a78bfa",
  "#fb923c",
  "#34d399",
  "#60a5fa",
  "#f472b6",
] as const;

export const SCORE_ROOM_STORAGE_KEY = "scoreRoomCode";

export function isValidRoomCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

export function normalizeScoreRoom(
  raw: Partial<ScoreRoom> | null | undefined,
  fallbackCode = "",
): ScoreRoom {
  return {
    roomCode: raw?.roomCode ?? fallbackCode,
    showScores: raw?.showScores ?? false,
    currentRound: raw?.currentRound ?? 1,
    pointsPerCorrect: raw?.pointsPerCorrect ?? 1,
    teams: raw?.teams ?? {},
    scoredRounds: raw?.scoredRounds ?? {},
    createdAt: raw?.createdAt ?? Date.now(),
  };
}

export function sortTeamsByScore(
  teams: Record<string, Team> | null | undefined,
): TeamWithId[] {
  return Object.entries(teams ?? {})
    .map(([id, team]) => ({ id, ...team }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "pl"));
}

/** Wszystkie drużyny z najwyższym wynikiem (remis o zwycięstwo). */
export function getTopTeams(
  teams: Record<string, Team> | null | undefined,
): TeamWithId[] {
  const sorted = sortTeamsByScore(teams);
  if (!sorted.length) return [];
  const topScore = sorted[0].score;
  return sorted.filter((team) => team.score === topScore);
}
