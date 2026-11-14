import { ONE } from "./fraction";
import { newId } from "./ids";
import {
  defaultBpm,
  defaultPattern,
  defaultPatternReference,
  findRudiment,
} from "./library";
import { scaleToStep } from "./timeline";
import { quarterTempo } from "./timing";
import type { Routine, RoutineExercise, RoutineRound, Rudiment } from "./types";

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

export const todaysRoutine: Routine = {
  id: "today",
  name: "Today's Routine",
  exercises: [
    presetExercise("today-e1", "single-stroke-roll", 3, 80, 7),
    presetExercise("today-e2", "double-stroke-roll", 3, 70, 7),
    presetExercise("today-e3", "single-paradiddle", 3, 60, 6),
  ],
};

function minutesOf(seconds: number) {
  return Math.max(1, Math.round(seconds / 60));
}

function secondsOf(exercise: RoutineExercise) {
  return exercise.rounds.reduce(
    (total, round) => total + round.durationSeconds,
    0,
  );
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
