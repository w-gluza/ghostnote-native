import { isFields, isName, isPositive, validateTempo } from "./validate.ts";
import type {
  ActiveSession,
  CompletedExercise,
  CompletedRound,
  PatternReference,
  PracticeSegment,
  PracticeSession,
  Routine,
  RoutineExercise,
  RoutineRound,
} from "./types";

export const SCHEMA_VERSION = 1;

export function encode(data: unknown) {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, data });
}

export function decode(text: string | null): unknown {
  if (text === null) {
    return undefined;
  }
  try {
    const stored: unknown = JSON.parse(text);
    return isFields(stored) && stored.schemaVersion === SCHEMA_VERSION
      ? stored.data
      : undefined;
  } catch {
    return undefined;
  }
}

export function validItems<Item>(
  value: unknown,
  isItem: (item: unknown) => item is Item,
): Item[] | undefined {
  return Array.isArray(value) ? value.filter(isItem) : undefined;
}

function isListOf<Item>(
  value: unknown,
  isItem: (item: unknown) => item is Item,
): value is Item[] {
  return Array.isArray(value) && value.every(isItem);
}

function isOptionalName(value: unknown) {
  return value === undefined || isName(value);
}

function isDuration(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isTimestamp(value: unknown): value is string {
  return isName(value) && !Number.isNaN(Date.parse(value));
}

export function isPatternReference(value: unknown): value is PatternReference {
  return (
    isFields(value) &&
    isName(value.rudimentId) &&
    isName(value.patternId) &&
    typeof value.patternVersion === "number" &&
    Number.isInteger(value.patternVersion)
  );
}

function isRound(value: unknown): value is RoutineRound {
  return (
    isFields(value) &&
    isName(value.id) &&
    validateTempo(value.tempo).length === 0 &&
    isDuration(value.durationSeconds) &&
    value.durationSeconds > 0
  );
}

function isExercise(value: unknown): value is RoutineExercise {
  return (
    isFields(value) &&
    isName(value.id) &&
    isPatternReference(value.pattern) &&
    isPositive(value.rhythmicScale) &&
    isListOf(value.rounds, isRound) &&
    value.rounds.length > 0
  );
}

export function isRoutine(value: unknown): value is Routine {
  return (
    isFields(value) &&
    isName(value.id) &&
    isName(value.name) &&
    isListOf(value.exercises, isExercise)
  );
}

export function isSegment(value: unknown): value is PracticeSegment {
  return (
    isFields(value) &&
    (value.startedAt === undefined || isTimestamp(value.startedAt)) &&
    validateTempo(value.tempo).length === 0 &&
    isPositive(value.rhythmicScale) &&
    isDuration(value.activeDurationMs)
  );
}

function isCompletedRound(value: unknown): value is CompletedRound {
  return (
    isFields(value) &&
    isName(value.id) &&
    isOptionalName(value.sourceRoundId) &&
    (value.outcome === "completed" || value.outcome === "partial") &&
    isListOf(value.segments, isSegment) &&
    isDuration(value.activeDurationMs) &&
    isTimestamp(value.completedAt)
  );
}

function isCompletedExercise(value: unknown): value is CompletedExercise {
  return (
    isFields(value) &&
    isOptionalName(value.sourceExerciseId) &&
    isName(value.rudimentName) &&
    isPatternReference(value.pattern) &&
    isListOf(value.rounds, isCompletedRound)
  );
}

export function isActiveSession(value: unknown): value is ActiveSession {
  return (
    isFields(value) &&
    isName(value.id) &&
    isOptionalName(value.routineId) &&
    isOptionalName(value.routineName) &&
    isTimestamp(value.startedAt) &&
    isListOf(value.exercises, isCompletedExercise)
  );
}

export function isPracticeSession(value: unknown): value is PracticeSession {
  return (
    isActiveSession(value) &&
    isTimestamp((value as { completedAt?: unknown }).completedAt) &&
    isDuration((value as { activeDurationMs?: unknown }).activeDurationMs)
  );
}
