import { clampBpm } from "../../rudiments/domain/timing.ts";

export const MAX_ROUNDS = 10;
export const MIN_ROUND_SECONDS = 10;
export const MAX_ROUND_SECONDS = 30 * 60;

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function parseDuration(text: string) {
  const match = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(text.trim());
  if (!match) {
    return undefined;
  }
  const seconds = Number(match[1]) * 60 + Number(match[2] ?? 0);
  return seconds >= MIN_ROUND_SECONDS && seconds <= MAX_ROUND_SECONDS
    ? seconds
    : undefined;
}

export function parseTempo(text: string) {
  const bpm = Number(text.trim());
  return Number.isInteger(bpm) && bpm === clampBpm(bpm) ? bpm : undefined;
}

type RoutineDraft = { name: string; exercises: readonly unknown[] };

export function hasRoutineChanged(saved: RoutineDraft, draft: RoutineDraft) {
  return (
    saved.name !== draft.name.trim() ||
    JSON.stringify(saved.exercises) !== JSON.stringify(draft.exercises)
  );
}
