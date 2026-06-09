import { blobToBase64, downloadJson } from "@/lib/io/blobUtils";
import type {
  ExportedTournament,
  TournamentState,
} from "@/lib/types/tournament";

export async function exportTournamentToJson(
  state: TournamentState,
): Promise<ExportedTournament> {
  const faceRounds = await Promise.all(
    state.faceRounds.map(async (round) => ({
      id: round.id,
      originalImageBase64: await blobToBase64(round.originalImageBlob),
      croppedImageBase64: round.croppedImageBlob
        ? await blobToBase64(round.croppedImageBlob)
        : null,
      cropCoordinates: round.cropCoordinates,
      personName: round.personName,
      focusMarker: round.focusMarker,
    })),
  );

  const triviaRounds = await Promise.all(
    state.triviaRounds.map(async (round) => ({
      id: round.id,
      type: round.type,
      question: round.question,
      imageBase64: round.imageBlob
        ? await blobToBase64(round.imageBlob)
        : null,
      options: round.options,
      correctAnswer: round.correctAnswer,
    })),
  );

  return {
    version: 2,
    id: state.id,
    name: state.name,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    faceRounds,
    harmonyRounds: state.harmonyRounds.map((r) => ({
      id: r.id,
      notes: r.notes,
      songTitle: r.songTitle,
    })),
    triviaRounds,
    showOrder: state.showOrder,
  };
}

export async function downloadTournament(state: TournamentState): Promise<void> {
  const exported = await exportTournamentToJson(state);
  const slug = state.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  downloadJson(`czyj-to-ryj-${slug || "tournament"}.json`, exported);
}
