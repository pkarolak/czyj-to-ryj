export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropMeta = {
  crop: CropArea;
  zoom: number;
  aspect: 1;
};

/** Współrzędne markera względem naturalnych wymiarów zdjęcia (0–1). */
export type FocusMarker = {
  x: number;
  y: number;
  radius: number;
};

export type RoundEntry = {
  id: string;
  originalImageBlob: Blob;
  originalPreviewUrl: string;
  croppedImageBlob: Blob | null;
  croppedPreviewUrl: string | null;
  cropCoordinates: CropMeta | null;
  personName: string;
  focusMarker: FocusMarker | null;
};

export type TournamentState = {
  version: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rounds: RoundEntry[];
};

export type ExportedRound = {
  id: string;
  originalImageBase64: string;
  croppedImageBase64: string | null;
  cropCoordinates: CropMeta | null;
  personName: string;
  focusMarker: FocusMarker | null;
};

export type ExportedTournament = {
  version: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rounds: ExportedRound[];
};

export const TOURNAMENT_VERSION = 1 as const;
export const MAX_IMPORT_SIZE_BYTES = 50 * 1024 * 1024;

export const DEFAULT_FOCUS_MARKER: FocusMarker = {
  x: 0.5,
  y: 0.5,
  radius: 0.07,
};

export function createEmptyTournament(name = "Nowy teleturniej"): TournamentState {
  const now = new Date().toISOString();
  return {
    version: TOURNAMENT_VERSION,
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    rounds: [],
  };
}

export function isRoundCropped(round: RoundEntry): boolean {
  return round.croppedImageBlob !== null && round.cropCoordinates !== null;
}

export function isRoundAnnotated(round: RoundEntry): boolean {
  return (
    round.personName.trim().length > 0 && round.focusMarker !== null
  );
}

export function allRoundsCropped(rounds: RoundEntry[]): boolean {
  return rounds.length > 0 && rounds.every(isRoundCropped);
}

export function allRoundsReady(rounds: RoundEntry[]): boolean {
  return rounds.length > 0 && rounds.every((r) => isRoundCropped(r) && isRoundAnnotated(r));
}
