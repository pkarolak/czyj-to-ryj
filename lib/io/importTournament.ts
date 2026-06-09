import { base64ToBlob } from "@/lib/io/blobUtils";
import {
  coerceExportedTournamentV2,
  detectTournamentExportVersion,
  isExportedTournamentV1,
  isExportedTournamentV2,
  normalizeImportedShowOrder,
  normalizeImportedTimerSettings,
} from "@/lib/io/tournamentValidation";
import { createRoundFromBlob } from "@/lib/images/createRoundFromFile";
import { blobToDataUrl, normalizeImageBlob } from "@/lib/images/fileToBlob";
import {
  DEFAULT_SHOW_ORDER,
  DEFAULT_TIMER_SECONDS,
  getMaxImportSizeLabel,
  MAX_IMPORT_SIZE_BYTES,
  TOURNAMENT_VERSION,
  type ExportedFaceRound,
  type ExportedHarmonyRound,
  type ExportedTriviaRound,
  type ExportedTournament,
  type ExportedTournamentV1,
  type HarmonyRound,
  type RoundEntry,
  type TournamentState,
  type TriviaRound,
} from "@/lib/types/tournament";

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

async function importTournamentV2(
  parsed: ExportedTournament,
): Promise<TournamentState> {
  const data = coerceExportedTournamentV2(parsed);
  const faceRounds = await Promise.all(data.faceRounds.map(importFaceRound));
  const triviaRounds = await Promise.all(
    data.triviaRounds.map(importTriviaRound),
  );

  return {
    version: TOURNAMENT_VERSION,
    id: data.id,
    name: data.name,
    createdAt: data.createdAt,
    updatedAt: new Date().toISOString(),
    faceRounds,
    harmonyRounds: data.harmonyRounds.map(importHarmonyRound),
    triviaRounds,
    showOrder: normalizeImportedShowOrder(data.showOrder),
    timerSeconds: normalizeImportedTimerSettings(data.timerSeconds),
  };
}

async function importTournamentV1(
  parsed: ExportedTournamentV1,
): Promise<TournamentState> {
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

export async function importTournamentFromParsed(
  parsed: unknown,
): Promise<TournamentState> {
  const version = detectTournamentExportVersion(parsed);
  if (version === 2 && isExportedTournamentV2(parsed)) {
    return importTournamentV2(parsed);
  }
  if (version === 1 && isExportedTournamentV1(parsed)) {
    return importTournamentV1(parsed);
  }
  throw new Error("Plik nie zawiera poprawnego teleturnieju.");
}

export async function parseTournamentFile(
  file: File,
): Promise<TournamentState> {
  if (file.size > MAX_IMPORT_SIZE_BYTES) {
    throw new Error(
      `Plik jest za duży (max ${getMaxImportSizeLabel()}). Skompresuj zdjęcia lub usuń część rund przed eksportem.`,
    );
  }

  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Nieprawidłowy format pliku JSON.");
  }

  return importTournamentFromParsed(parsed);
}
