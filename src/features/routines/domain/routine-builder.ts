import { ONE } from "../../rudiments/domain/fraction.ts";
import { newId } from "../../rudiments/domain/ids.ts";
import {
  defaultBpm,
  defaultPattern,
  defaultPatternReference,
  findRudiment,
} from "../../rudiments/domain/library.ts";
import { scaleToStep } from "../../rudiments/domain/timeline.ts";
import { quarterTempo } from "../../rudiments/domain/timing.ts";
import type { Routine, RoutineExercise, RoutineRound } from "./types";
import type { Rudiment } from "../../rudiments/domain/types";

export const NEW_ROUND_SECONDS = 120;
const NEW_EXERCISE_ROUNDS = 3;

export function newRound(bpm: number, durationSeconds: number): RoutineRound {
  return { id: newId("round"), tempo: quarterTempo(bpm), durationSeconds };
}

export function newExercise(rudiment: Rudiment): RoutineExercise {
  return {
    id: newId("exercise"),
    pattern: defaultPatternReference(rudiment),
    rhythmicScale: scaleToStep(defaultPattern(rudiment), ONE),
    rounds: Array.from({ length: NEW_EXERCISE_ROUNDS }, () =>
      newRound(defaultBpm(rudiment), NEW_ROUND_SECONDS),
    ),
  };
}

export function presetExercise(
  id: string,
  rudimentId: string,
  count: number,
  bpm: number,
  minutes: number,
): RoutineExercise {
  const rudiment = findRudiment(rudimentId);
  if (!rudiment) {
    throw new Error(`No rudiment called ${rudimentId}`);
  }
  const durationSeconds = Math.round((minutes * 60) / count);
  return {
    id,
    pattern: defaultPatternReference(rudiment),
    rhythmicScale: scaleToStep(defaultPattern(rudiment), ONE),
    rounds: Array.from({ length: count }, (_, index) => ({
      id: `${id}-r${index + 1}`,
      tempo: quarterTempo(bpm),
      durationSeconds,
    })),
  };
}

function minutesOf(seconds: number) {
  return Math.max(1, Math.round(seconds / 60));
}

function secondsOf(exercise: RoutineExercise) {
  return exercise.rounds.reduce(
    (total, round) => total + round.durationSeconds,
    0,
  );
}

export function exercisesLabel(count: number) {
  return count === 1 ? "1 exercise" : `${count} exercises`;
}

export function exerciseMinutes(exercise: RoutineExercise) {
  return minutesOf(secondsOf(exercise));
}

export function routineMinutes(routine: Pick<Routine, "exercises">) {
  if (routine.exercises.length === 0) {
    return 0;
  }
  return minutesOf(
    routine.exercises.reduce(
      (total, exercise) => total + secondsOf(exercise),
      0,
    ),
  );
}

export function routineLevel(routine: Pick<Routine, "exercises">) {
  return Math.max(
    1,
    ...routine.exercises.map(
      (exercise) => findRudiment(exercise.pattern.rudimentId)?.level ?? 1,
    ),
  );
}
