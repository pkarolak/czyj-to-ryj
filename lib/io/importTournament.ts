import { base64ToBlob } from "@/lib/io/blobUtils";
import { createRoundFromBlob } from "@/lib/images/createRoundFromFile";
import { blobToDataUrl, normalizeImageBlob } from "@/lib/images/fileToBlob";
import {
  MAX_IMPORT_SIZE_BYTES,
  TOURNAMENT_VERSION,
  type ExportedTournament,
  type RoundEntry,
  type TournamentState,
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

function isExportedTournament(value: unknown): value is ExportedTournament {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.version !== TOURNAMENT_VERSION) return false;
  if (typeof v.id !== "string" || typeof v.name !== "string") return false;
  if (typeof v.createdAt !== "string" || typeof v.updatedAt !== "string")
    return false;
  if (!Array.isArray(v.rounds)) return false;

  return v.rounds.every((round) => {
    if (!round || typeof round !== "object") return false;
    const r = round as Record<string, unknown>;
    return (
      typeof r.id === "string" &&
      typeof r.originalImageBase64 === "string" &&
      (r.croppedImageBase64 === null ||
        typeof r.croppedImageBase64 === "string") &&
      (r.cropCoordinates === null || isCropMeta(r.cropCoordinates))
    );
  });
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

  if (!isExportedTournament(parsed)) {
    throw new Error("Plik nie zawiera poprawnego teleturnieju.");
  }

  const rounds: RoundEntry[] = await Promise.all(
    parsed.rounds.map(async (round) => {
      const base = await createRoundFromBlob(
        base64ToBlob(round.originalImageBase64),
        round.id,
        `round-${round.id}.jpeg`,
      );

      if (!round.croppedImageBase64) return base;

      const croppedImageBlob = await normalizeImageBlob(
        base64ToBlob(round.croppedImageBase64),
        `crop-${round.id}.png`,
      );

      return {
        ...base,
        croppedImageBlob,
        croppedPreviewUrl: await blobToDataUrl(croppedImageBlob),
        cropCoordinates: round.cropCoordinates,
      };
    }),
  );

  return {
    version: TOURNAMENT_VERSION,
    id: parsed.id,
    name: parsed.name,
    createdAt: parsed.createdAt,
    updatedAt: new Date().toISOString(),
    rounds,
  };
}
