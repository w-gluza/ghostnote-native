import {
  isFields,
  isName,
  isPatternReference,
  isPositive,
  validateTempo,
} from "../../rudiments/domain/validate.ts";
import { isDuration, isListOf } from "../../../storage/validators.ts";
import type { Routine, RoutineExercise, RoutineRound } from "./types";

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
