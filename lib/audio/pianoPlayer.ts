import * as Tone from "tone";
import { isValidNotePitch, type NotePitch } from "@/lib/types/tournament";

let synth: Tone.PolySynth | null = null;
let initialized = false;

async function ensureSynth(): Promise<Tone.PolySynth> {
  if (synth) return synth;
  await Tone.start();
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.1,
      release: 0.8,
    },
  }).toDestination();
  synth.volume.value = -6;
  initialized = true;
  return synth;
}

export async function unlockAudio(): Promise<void> {
  await ensureSynth();
}

export function isAudioReady(): boolean {
  return initialized;
}

export async function playNote(
  pitch: NotePitch,
  durationMs = 600,
): Promise<void> {
  if (!isValidNotePitch(pitch)) return;
  const player = await ensureSynth();
  const duration = durationMs / 1000;
  player.triggerAttackRelease(pitch, duration);
  await new Promise((r) => setTimeout(r, durationMs + 80));
}

export async function playSequence(
  notes: NotePitch[],
  options?: { noteDurationMs?: number; gapMs?: number },
): Promise<void> {
  const noteDurationMs = options?.noteDurationMs ?? 600;
  const gapMs = options?.gapMs ?? 120;

  for (const note of notes) {
    if (!isValidNotePitch(note)) continue;
    await playNote(note, noteDurationMs);
    if (gapMs > 0) await new Promise((r) => setTimeout(r, gapMs));
  }
}

export function stopPlayback(): void {
  synth?.releaseAll();
}
