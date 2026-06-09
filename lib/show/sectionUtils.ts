import type { ShowRound } from "@/lib/types/tournament";

export function isFirstRoundOfSection(
  queue: ShowRound[],
  index: number,
): boolean {
  if (index <= 0) return true;
  return queue[index]?.sectionLabel !== queue[index - 1]?.sectionLabel;
}

export function isLastRoundOfSection(
  queue: ShowRound[],
  index: number,
): boolean {
  if (index >= queue.length - 1) return true;
  return queue[index]?.sectionLabel !== queue[index + 1]?.sectionLabel;
}

export function roundNumberInSection(
  queue: ShowRound[],
  index: number,
): number {
  const section = queue[index]?.sectionLabel;
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (queue[i]?.sectionLabel === section) count++;
  }
  return count;
}

export function totalRoundsInSection(
  queue: ShowRound[],
  index: number,
): number {
  const section = queue[index]?.sectionLabel;
  return queue.filter((round) => round.sectionLabel === section).length;
}

/** Numer konkurencji w show (1–3), nie numer pytania w konkurencji. */
export function competitionNumberInShow(
  queue: ShowRound[],
  index: number,
): number {
  if (!queue[index]) return 0;
  let competition = 1;
  for (let i = 1; i <= index; i++) {
    if (queue[i].sectionLabel !== queue[i - 1].sectionLabel) {
      competition++;
    }
  }
  return competition;
}

export function totalCompetitionsInShow(queue: ShowRound[]): number {
  if (!queue.length) return 0;
  let count = 1;
  for (let i = 1; i < queue.length; i++) {
    if (queue[i].sectionLabel !== queue[i - 1].sectionLabel) count++;
  }
  return count;
}
