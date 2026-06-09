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

export type CompetitionId = "face" | "harmony" | "trivia";

export type NotePitch = string;

export type HarmonyRound = {
  id: string;
  notes: NotePitch[];
  songTitle: string;
};

export type TriviaRoundType = "closed" | "open";

export type TriviaRound = {
  id: string;
  type: TriviaRoundType;
  question: string;
  imageBlob: Blob | null;
  imagePreviewUrl: string | null;
  options: string[] | null;
  correctAnswer: string;
};

export type TournamentState = {
  version: 2;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  faceRounds: RoundEntry[];
  harmonyRounds: HarmonyRound[];
  triviaRounds: TriviaRound[];
  showOrder: CompetitionId[];
};

export type ShowRound =
  | { id: string; type: "face"; data: RoundEntry; sectionLabel: string }
  | { id: string; type: "harmony"; data: HarmonyRound; sectionLabel: string }
  | { id: string; type: "trivia"; data: TriviaRound; sectionLabel: string };

export type ExportedFaceRound = {
  id: string;
  originalImageBase64: string;
  croppedImageBase64: string | null;
  cropCoordinates: CropMeta | null;
  personName: string;
  focusMarker: FocusMarker | null;
};

export type ExportedHarmonyRound = {
  id: string;
  notes: NotePitch[];
  songTitle: string;
};

export type ExportedTriviaRound = {
  id: string;
  type: TriviaRoundType;
  question: string;
  imageBase64: string | null;
  options: string[] | null;
  correctAnswer: string;
};

export type ExportedTournamentV1 = {
  version: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rounds: ExportedFaceRound[];
};

export type ExportedTournament = {
  version: 2;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  faceRounds: ExportedFaceRound[];
  harmonyRounds: ExportedHarmonyRound[];
  triviaRounds: ExportedTriviaRound[];
  showOrder: CompetitionId[];
};

/** @deprecated v1 shape kept for migration */
export type LegacyTournamentState = {
  version: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rounds: RoundEntry[];
};

export const TOURNAMENT_VERSION = 2 as const;
export const MAX_IMPORT_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_HARMONY_NOTES = 11;

export const DEFAULT_SHOW_ORDER: CompetitionId[] = [
  "face",
  "harmony",
  "trivia",
];

export const COMPETITION_LABELS: Record<CompetitionId, string> = {
  face: "Czyj to ryj?",
  harmony: "Jaka to harmonia?",
  trivia: "Taki jesteś mądry?",
};

export const DEFAULT_FOCUS_MARKER: FocusMarker = {
  x: 0.5,
  y: 0.5,
  radius: 0.07,
};

const NOTE_REGEX = /^[A-Ga-g](#|b)?-?\d$/;

export function isValidNotePitch(note: string): boolean {
  const normalized = note.trim().replace(/\s+/g, "");
  if (!NOTE_REGEX.test(normalized)) return false;
  const match = normalized.match(/^([A-Ga-g])(#|b)?-?(\d)$/);
  if (!match) return false;
  const octave = Number(match[3]);
  return octave >= 0 && octave <= 8;
}

export function parseNoteSequence(input: string): NotePitch[] {
  return input
    .split(/[,;\s]+/)
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => {
      const m = n.match(/^([A-Ga-g])(#|b)?-?(\d)$/);
      if (!m) return n;
      return `${m[1].toUpperCase()}${m[2] ?? ""}${m[3]}`;
    });
}

export function createEmptyTournament(name = "Nowy teleturniej"): TournamentState {
  const now = new Date().toISOString();
  return {
    version: TOURNAMENT_VERSION,
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    faceRounds: [],
    harmonyRounds: [],
    triviaRounds: [],
    showOrder: [...DEFAULT_SHOW_ORDER],
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
  return (
    rounds.length > 0 &&
    rounds.every((r) => isRoundCropped(r) && isRoundAnnotated(r))
  );
}

export function isHarmonyRoundReady(round: HarmonyRound): boolean {
  return (
    round.notes.length >= 1 &&
    round.notes.length <= MAX_HARMONY_NOTES &&
    round.notes.every(isValidNotePitch) &&
    round.songTitle.trim().length > 0
  );
}

export function isTriviaRoundReady(round: TriviaRound): boolean {
  if (!round.question.trim() || !round.correctAnswer.trim()) return false;
  if (round.type === "open") return true;
  const options = round.options ?? [];
  return (
    options.length >= 2 &&
    options.every((o) => o.trim().length > 0) &&
    options.includes(round.correctAnswer)
  );
}

export function isShowReady(state: TournamentState): boolean {
  return buildShowQueue(state).length > 0;
}

export function buildShowQueue(state: TournamentState): ShowRound[] {
  const queue: ShowRound[] = [];

  for (const section of state.showOrder) {
    if (section === "face") {
      const ready = state.faceRounds.filter(
        (r) => isRoundCropped(r) && isRoundAnnotated(r),
      );
      for (const data of ready) {
        queue.push({
          id: data.id,
          type: "face",
          data,
          sectionLabel: COMPETITION_LABELS.face,
        });
      }
    } else if (section === "harmony") {
      const ready = state.harmonyRounds.filter(isHarmonyRoundReady);
      for (const data of ready) {
        queue.push({
          id: data.id,
          type: "harmony",
          data,
          sectionLabel: COMPETITION_LABELS.harmony,
        });
      }
    } else if (section === "trivia") {
      const ready = state.triviaRounds.filter(isTriviaRoundReady);
      for (const data of ready) {
        queue.push({
          id: data.id,
          type: "trivia",
          data,
          sectionLabel: COMPETITION_LABELS.trivia,
        });
      }
    }
  }

  return queue;
}

export function migrateTournament(
  data: LegacyTournamentState | TournamentState | null,
): TournamentState | null {
  if (!data) return null;

  if (data.version === 2) {
    return {
      ...data,
      faceRounds: data.faceRounds ?? [],
      harmonyRounds: data.harmonyRounds ?? [],
      triviaRounds: data.triviaRounds ?? [],
      showOrder: data.showOrder ?? [...DEFAULT_SHOW_ORDER],
    };
  }

  if (data.version === 1 && "rounds" in data) {
    const legacy = data as LegacyTournamentState;
    return {
      version: 2,
      id: legacy.id,
      name: legacy.name,
      createdAt: legacy.createdAt,
      updatedAt: legacy.updatedAt,
      faceRounds: legacy.rounds ?? [],
      harmonyRounds: [],
      triviaRounds: [],
      showOrder: [...DEFAULT_SHOW_ORDER],
    };
  }

  return null;
}
