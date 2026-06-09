import { base64ToBlob } from "@/lib/io/blobUtils";
import { createRoundFromBlob } from "@/lib/images/createRoundFromFile";
import { blobToDataUrl, normalizeImageBlob } from "@/lib/images/fileToBlob";
import {
  DEFAULT_SHOW_ORDER,
  DEFAULT_TIMER_SECONDS,
  MAX_IMPORT_SIZE_BYTES,
  type TimerSettings,
  TOURNAMENT_VERSION,
  type CompetitionId,
  type ExportedFaceRound,
  type ExportedHarmonyRound,
  type ExportedTriviaRound,
  type ExportedTournament,
  type ExportedTournamentV1,
  type FocusMarker,
  type HarmonyRound,
  type RoundEntry,
  type TournamentState,
  type TriviaRound,
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

function isExportedFaceRound(value: unknown): value is ExportedFaceRound {
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

function isExportedHarmonyRound(value: unknown): value is ExportedHarmonyRound {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    Array.isArray(r.notes) &&
    r.notes.every((n) => typeof n === "string") &&
    typeof r.songTitle === "string"
  );
}

function isExportedTriviaRound(value: unknown): value is ExportedTriviaRound {
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

function isShowOrder(value: unknown): value is CompetitionId[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => v === "face" || v === "harmony" || v === "trivia")
  );
}

function isExportedTournamentV2(value: unknown): value is ExportedTournament {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 2) return false;
  if (typeof v.id !== "string" || typeof v.name !== "string") return false;
  if (typeof v.createdAt !== "string" || typeof v.updatedAt !== "string")
    return false;
  if (!Array.isArray(v.faceRounds) || !v.faceRounds.every(isExportedFaceRound))
    return false;
  if (
    !Array.isArray(v.harmonyRounds) ||
    !v.harmonyRounds.every(isExportedHarmonyRound)
  )
    return false;
  if (!Array.isArray(v.triviaRounds) || !v.triviaRounds.every(isExportedTriviaRound))
    return false;
  if (!isShowOrder(v.showOrder)) return false;
  if (v.timerSeconds === undefined) return true;
  return isTimerSettings(v.timerSeconds);
}

function isTimerSettings(value: unknown): value is TimerSettings {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.face === "number" &&
    typeof v.harmony === "number" &&
    typeof v.trivia === "number"
  );
}

function isExportedTournamentV1(value: unknown): value is ExportedTournamentV1 {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 1) return false;
  if (typeof v.id !== "string" || typeof v.name !== "string") return false;
  if (typeof v.createdAt !== "string" || typeof v.updatedAt !== "string")
    return false;
  if (!Array.isArray(v.rounds)) return false;
  return v.rounds.every(isExportedFaceRound);
}

async function importFaceRound(round: ExportedFaceRound): Promise<RoundEntry> {
  const base = await createRoundFromBlob(
    base64ToBlob(round.originalImageBase64),
    round.id,
    `round-${round.id}.jpeg`,
  );

  const withMeta = {
    ...base,
    personName: round.personName ?? "",
    focusMarker: round.focusMarker ?? null,
  };

  if (!round.croppedImageBase64) return withMeta;

  const croppedImageBlob = await normalizeImageBlob(
    base64ToBlob(round.croppedImageBase64),
    `crop-${round.id}.png`,
  );

  return {
    ...withMeta,
    croppedImageBlob,
    croppedPreviewUrl: await blobToDataUrl(croppedImageBlob),
    cropCoordinates: round.cropCoordinates,
  };
}

async function importTriviaRound(round: ExportedTriviaRound): Promise<TriviaRound> {
  let imageBlob: Blob | null = null;
  let imagePreviewUrl: string | null = null;

  if (round.imageBase64) {
    imageBlob = await normalizeImageBlob(
      base64ToBlob(round.imageBase64),
      `trivia-${round.id}.jpeg`,
    );
    imagePreviewUrl = await blobToDataUrl(imageBlob);
  }

  return {
    id: round.id,
    type: round.type,
    question: round.question,
    imageBlob,
    imagePreviewUrl,
    options: round.options,
    correctAnswer: round.correctAnswer,
  };
}

function importHarmonyRound(round: ExportedHarmonyRound): HarmonyRound {
  return {
    id: round.id,
    notes: round.notes,
    songTitle: round.songTitle,
  };
}

export async function parseTournamentFile(
  file: File,
): Promise<TournamentState> {
  if (file.size > MAX_IMPORT_SIZE_BYTES) {
    throw new Error(
      `Plik jest za duży (max ${Math.round(MAX_IMPORT_SIZE_BYTES / 1024 / 1024)} MB).`,
    );
  }

  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Nieprawidłowy format pliku JSON.");
  }

  if (isExportedTournamentV2(parsed)) {
    const faceRounds = await Promise.all(parsed.faceRounds.map(importFaceRound));
    const triviaRounds = await Promise.all(
      parsed.triviaRounds.map(importTriviaRound),
    );

    return {
      version: TOURNAMENT_VERSION,
      id: parsed.id,
      name: parsed.name,
      createdAt: parsed.createdAt,
      updatedAt: new Date().toISOString(),
      faceRounds,
      harmonyRounds: parsed.harmonyRounds.map(importHarmonyRound),
      triviaRounds,
      showOrder: parsed.showOrder,
      timerSeconds: {
        ...DEFAULT_TIMER_SECONDS,
        ...parsed.timerSeconds,
      },
    };
  }

  if (isExportedTournamentV1(parsed)) {
    const faceRounds = await Promise.all(parsed.rounds.map(importFaceRound));
    return {
      version: TOURNAMENT_VERSION,
      id: parsed.id,
      name: parsed.name,
      createdAt: parsed.createdAt,
      updatedAt: new Date().toISOString(),
      faceRounds,
      harmonyRounds: [],
      triviaRounds: [],
      showOrder: [...DEFAULT_SHOW_ORDER],
      timerSeconds: { ...DEFAULT_TIMER_SECONDS },
    };
  }

  throw new Error("Plik nie zawiera poprawnego teleturnieju.");
}
