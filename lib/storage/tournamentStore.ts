import localforage from "localforage";
import { createRoundFromBlob } from "@/lib/images/createRoundFromFile";
import { blobToDataUrl, isValidImageBlob, normalizeImageBlob } from "@/lib/images/fileToBlob";
import {
  migrateTournament,
  type LegacyTournamentState,
  type RoundEntry,
  type TournamentState,
  type TriviaRound,
} from "@/lib/types/tournament";

const STORE_NAME = "czyj-to-ryj";
const TOURNAMENT_KEY = "current-tournament";

const store = localforage.createInstance({
  name: STORE_NAME,
  storeName: "tournaments",
  driver: localforage.INDEXEDDB,
});

async function hydrateRound(round: RoundEntry): Promise<RoundEntry | null> {
  if (!isValidImageBlob(round.originalImageBlob)) return null;

  try {
    if (round.originalPreviewUrl?.startsWith("data:image/")) {
      const croppedPreviewUrl =
        round.croppedImageBlob && isValidImageBlob(round.croppedImageBlob)
          ? round.croppedPreviewUrl?.startsWith("data:image/")
            ? round.croppedPreviewUrl
            : await blobToDataUrl(
                await normalizeImageBlob(
                  round.croppedImageBlob,
                  `crop-${round.id}.png`,
                ),
              )
          : null;

      return {
        ...round,
        croppedPreviewUrl,
        cropCoordinates: round.cropCoordinates ?? null,
        personName: round.personName ?? "",
        focusMarker: round.focusMarker ?? null,
      };
    }

    return createRoundFromBlob(
      round.originalImageBlob,
      round.id,
      `round-${round.id}.jpeg`,
    ).then(async (hydrated) => {
      if (round.croppedImageBlob && isValidImageBlob(round.croppedImageBlob)) {
        const croppedBlob = await normalizeImageBlob(
          round.croppedImageBlob,
          `crop-${round.id}.png`,
        );
        return {
          ...hydrated,
          croppedImageBlob: croppedBlob,
          croppedPreviewUrl: await blobToDataUrl(croppedBlob),
          cropCoordinates: round.cropCoordinates ?? null,
          personName: round.personName ?? "",
          focusMarker: round.focusMarker ?? null,
        };
      }
      return hydrated;
    });
  } catch {
    return null;
  }
}

async function hydrateTriviaRound(round: TriviaRound): Promise<TriviaRound> {
  if (!round.imageBlob || !isValidImageBlob(round.imageBlob)) {
    return { ...round, imageBlob: null, imagePreviewUrl: null };
  }

  try {
    const preview =
      round.imagePreviewUrl?.startsWith("data:image/")
        ? round.imagePreviewUrl
        : await blobToDataUrl(
            await normalizeImageBlob(round.imageBlob, `trivia-${round.id}.jpeg`),
          );
    return { ...round, imagePreviewUrl: preview };
  } catch {
    return { ...round, imageBlob: null, imagePreviewUrl: null };
  }
}

async function normalizeTournament(
  data: TournamentState | LegacyTournamentState | null,
): Promise<TournamentState | null> {
  const migrated = migrateTournament(data);
  if (!migrated) return null;

  const faceRounds = (
    await Promise.all(migrated.faceRounds.map(hydrateRound))
  ).filter((r): r is RoundEntry => r !== null);

  const triviaRounds = await Promise.all(
    migrated.triviaRounds.map(hydrateTriviaRound),
  );

  return {
    ...migrated,
    faceRounds,
    triviaRounds,
  };
}

export async function loadTournament(): Promise<TournamentState | null> {
  const data = await store.getItem<TournamentState | LegacyTournamentState>(
    TOURNAMENT_KEY,
  );
  return normalizeTournament(data);
}

export async function saveTournament(state: TournamentState): Promise<void> {
  await store.setItem(TOURNAMENT_KEY, state);
}

export async function clearTournament(): Promise<void> {
  await store.removeItem(TOURNAMENT_KEY);
}
