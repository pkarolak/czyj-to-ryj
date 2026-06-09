/**
 * Weryfikacja eksportu/importu teleturnieju (v1 + v2).
 * Uruchom: npx tsx scripts/verify-tournament-io.ts
 */
import assert from "node:assert/strict";
import { exportTournamentToJson } from "../lib/io/exportTournament";
import { importTournamentFromParsed } from "../lib/io/importTournament";
import {
  detectTournamentExportVersion,
  normalizeImportedTimerSettings,
} from "../lib/io/tournamentValidation";
import {
  DEFAULT_SHOW_ORDER,
  DEFAULT_TIMER_SECONDS,
  type TournamentState,
} from "../lib/types/tournament";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function makeSampleState(): TournamentState {
  const now = new Date().toISOString();
  const faceBlob = new Blob([Uint8Array.from([0xff, 0xd8, 0xff, 0xd9])], {
    type: "image/jpeg",
  });

  return {
    version: 2,
    id: "test-id",
    name: "Test teleturniej",
    createdAt: now,
    updatedAt: now,
    faceRounds: [
      {
        id: "face-1",
        originalImageBlob: faceBlob,
        originalPreviewUrl: TINY_PNG,
        croppedImageBlob: faceBlob,
        croppedPreviewUrl: TINY_PNG,
        cropCoordinates: {
          crop: { x: 0, y: 0, width: 100, height: 100 },
          zoom: 1,
          aspect: 1,
        },
        personName: "Jan",
        focusMarker: { x: 0.5, y: 0.5, radius: 0.07 },
      },
    ],
    harmonyRounds: [
      {
        id: "harmony-1",
        notes: ["C4", "E4", "G4"],
        songTitle: "Test Song",
      },
    ],
    triviaRounds: [
      {
        id: "trivia-1",
        type: "closed",
        question: "Ile nut w gamie?",
        imageBlob: null,
        imagePreviewUrl: null,
        options: ["5", "6", "7", "8"],
        correctAnswer: "7",
      },
      {
        id: "trivia-2",
        type: "open",
        question: "Stolica Polski?",
        imageBlob: null,
        imagePreviewUrl: null,
        options: null,
        correctAnswer: "Warszawa",
      },
    ],
    showOrder: ["harmony", "face", "trivia"],
    timerSeconds: { face: 12, harmony: 25, trivia: 60 },
  };
}

async function run() {
  // Walidacja wersji
  assert.equal(detectTournamentExportVersion({ version: 99 }), null);
  assert.equal(
    detectTournamentExportVersion({
      version: 1,
      id: "a",
      name: "b",
      createdAt: "c",
      updatedAt: "d",
      rounds: [],
    }),
    1,
  );

  const timers = normalizeImportedTimerSettings({ face: 3, harmony: 999, trivia: 40 });
  assert.equal(timers.face, 5);
  assert.equal(timers.harmony, 180);
  assert.equal(timers.trivia, 40);

  // Eksport pełnego stanu
  const state = makeSampleState();
  const exported = await exportTournamentToJson(state);
  assert.equal(exported.version, 2);
  assert.equal(exported.faceRounds.length, 1);
  assert.equal(exported.harmonyRounds.length, 1);
  assert.equal(exported.triviaRounds.length, 2);
  assert.deepEqual(exported.showOrder, ["harmony", "face", "trivia"]);
  assert.deepEqual(exported.timerSeconds, { face: 12, harmony: 25, trivia: 60 });
  assert.equal(exported.harmonyRounds[0]?.notes.join(","), "C4,E4,G4");

  // Import z powrotem (bez ponownego ładowania obrazów face — tylko metadane harmony/trivia)
  const imported = await importTournamentFromParsed(exported);
  assert.equal(imported.name, "Test teleturniej");
  assert.equal(imported.harmonyRounds[0]?.songTitle, "Test Song");
  assert.equal(imported.triviaRounds[0]?.correctAnswer, "7");
  assert.equal(imported.triviaRounds[1]?.type, "open");
  assert.deepEqual(imported.showOrder, ["harmony", "face", "trivia"]);
  assert.deepEqual(imported.timerSeconds, { face: 12, harmony: 25, trivia: 60 });
  assert.equal(imported.faceRounds.length, 1);
  assert.equal(imported.faceRounds[0]?.personName, "Jan");

  // v1 backward compat
  const v1 = {
    version: 1,
    id: "legacy",
    name: "Stary",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    rounds: [],
  };
  const fromV1 = await importTournamentFromParsed(v1);
  assert.equal(fromV1.harmonyRounds.length, 0);
  assert.deepEqual(fromV1.showOrder, DEFAULT_SHOW_ORDER);
  assert.deepEqual(fromV1.timerSeconds, DEFAULT_TIMER_SECONDS);

  // v2 bez opcjonalnych tablic (stary plik)
  const minimalV2 = {
    version: 2,
    id: "min",
    name: "Min",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    faceRounds: [],
    showOrder: ["face", "trivia", "harmony"],
  };
  assert.equal(detectTournamentExportVersion(minimalV2), 2);
  const fromMinimal = await importTournamentFromParsed(minimalV2);
  assert.deepEqual(fromMinimal.harmonyRounds, []);
  assert.deepEqual(fromMinimal.triviaRounds, []);

  console.log("✓ Eksport/import teleturnieju — wszystkie testy przeszły.");
}

function nowIso() {
  return new Date().toISOString();
}

run().catch((err) => {
  console.error("✗ Test eksportu/importu nie powiódł się:", err);
  process.exit(1);
});
