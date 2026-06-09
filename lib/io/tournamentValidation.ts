import {
  DEFAULT_SHOW_ORDER,
  DEFAULT_TIMER_SECONDS,
  MAX_TIMER_SECONDS,
  MIN_TIMER_SECONDS,
  type CompetitionId,
  type ExportedFaceRound,
  type ExportedHarmonyRound,
  type ExportedTriviaRound,
  type ExportedTournament,
  type ExportedTournamentV1,
  type FocusMarker,
  type TimerSettings,
} from "@/lib/types/tournament";

function isCropMeta(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.zoom !== "number" || v.aspect !== 1) return false;
  const crop = v.crop as Record<string, unknown> | undefined;
  return (
    !!crop &&
    typeof crop.x === "number" &&
    typeof crop.y === "number" &&
    typeof crop.width === "number" &&
    typeof crop.height === "number"
  );
}

function isFocusMarker(value: unknown): value is FocusMarker {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.x === "number" &&
    typeof v.y === "number" &&
    typeof v.radius === "number"
  );
}

export function isExportedFaceRound(value: unknown): value is ExportedFaceRound {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.originalImageBase64 === "string" &&
    (r.croppedImageBase64 === null || typeof r.croppedImageBase64 === "string") &&
    (r.cropCoordinates === null || isCropMeta(r.cropCoordinates)) &&
    (r.personName === undefined || typeof r.personName === "string") &&
    (r.focusMarker === undefined ||
      r.focusMarker === null ||
      isFocusMarker(r.focusMarker))
  );
}

export function isExportedHarmonyRound(
  value: unknown,
): value is ExportedHarmonyRound {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    Array.isArray(r.notes) &&
    r.notes.every((n) => typeof n === "string") &&
    typeof r.songTitle === "string"
  );
}

export function isExportedTriviaRound(
  value: unknown,
): value is ExportedTriviaRound {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    (r.type === "closed" || r.type === "open") &&
    typeof r.question === "string" &&
    (r.imageBase64 === null || typeof r.imageBase64 === "string") &&
    (r.options === null ||
      (Array.isArray(r.options) && r.options.every((o) => typeof o === "string"))) &&
    typeof r.correctAnswer === "string"
  );
}

export function isShowOrder(value: unknown): value is CompetitionId[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => v === "face" || v === "harmony" || v === "trivia")
  );
}

export function isTimerSettings(value: unknown): value is TimerSettings {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.face === "number" &&
    typeof v.harmony === "number" &&
    typeof v.trivia === "number"
  );
}

export function isExportedTournamentV2(value: unknown): value is ExportedTournament {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 2) return false;
  if (typeof v.id !== "string" || typeof v.name !== "string") return false;
  if (typeof v.createdAt !== "string" || typeof v.updatedAt !== "string")
    return false;

  const faceRounds = v.faceRounds;
  if (!Array.isArray(faceRounds) || !faceRounds.every(isExportedFaceRound))
    return false;

  const harmonyRounds = Array.isArray(v.harmonyRounds) ? v.harmonyRounds : [];
  if (!harmonyRounds.every(isExportedHarmonyRound)) return false;

  const triviaRounds = Array.isArray(v.triviaRounds) ? v.triviaRounds : [];
  if (!triviaRounds.every(isExportedTriviaRound)) return false;

  if (!isShowOrder(v.showOrder)) return false;
  if (v.timerSeconds !== undefined && !isTimerSettings(v.timerSeconds))
    return false;

  return true;
}

export function isExportedTournamentV1(value: unknown): value is ExportedTournamentV1 {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 1) return false;
  if (typeof v.id !== "string" || typeof v.name !== "string") return false;
  if (typeof v.createdAt !== "string" || typeof v.updatedAt !== "string")
    return false;
  if (!Array.isArray(v.rounds)) return false;
  return v.rounds.every(isExportedFaceRound);
}

export function detectTournamentExportVersion(
  value: unknown,
): 1 | 2 | null {
  if (isExportedTournamentV2(value)) return 2;
  if (isExportedTournamentV1(value)) return 1;
  return null;
}

export function normalizeImportedTimerSettings(
  raw?: Partial<TimerSettings> | null,
): TimerSettings {
  const clamp = (n: number, fallback: number) => {
    if (!Number.isFinite(n)) return fallback;
    return Math.min(MAX_TIMER_SECONDS, Math.max(MIN_TIMER_SECONDS, Math.round(n)));
  };

  return {
    face: clamp(raw?.face ?? NaN, DEFAULT_TIMER_SECONDS.face),
    harmony: clamp(raw?.harmony ?? NaN, DEFAULT_TIMER_SECONDS.harmony),
    trivia: clamp(raw?.trivia ?? NaN, DEFAULT_TIMER_SECONDS.trivia),
  };
}

export function normalizeImportedShowOrder(raw: unknown): CompetitionId[] {
  if (isShowOrder(raw)) return raw;
  return [...DEFAULT_SHOW_ORDER];
}

export function coerceExportedTournamentV2(
  value: ExportedTournament,
): ExportedTournament {
  return {
    ...value,
    harmonyRounds: value.harmonyRounds ?? [],
    triviaRounds: value.triviaRounds ?? [],
    showOrder: normalizeImportedShowOrder(value.showOrder),
    timerSeconds: value.timerSeconds,
  };
}
