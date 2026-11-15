import {
  isFields,
  isName,
  isPatternReference,
  isPositive,
  validateTempo,
} from "../../rudiments/domain/validate.ts";
import {
  isDuration,
  isListOf,
  isTimestamp,
} from "../../../storage/validators.ts";
import type {
  ActiveSession,
  CompletedExercise,
  CompletedRound,
  PracticeSegment,
  PracticeSession,
} from "./types";

function isOptionalName(value: unknown) {
  return value === undefined || isName(value);
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
