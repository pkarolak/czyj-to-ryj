import { blobToBase64, downloadJson } from "@/lib/io/blobUtils";
import type {
  ExportedTournament,
  TournamentState,
} from "@/lib/types/tournament";

export async function exportTournamentToJson(
  state: TournamentState,
): Promise<ExportedTournament> {
  const rounds = await Promise.all(
    state.rounds.map(async (round) => ({
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

  return {
    version: 1,
    id: state.id,
    name: state.name,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    rounds,
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
