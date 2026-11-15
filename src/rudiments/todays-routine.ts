import { ONE } from "./fraction.ts";
import { newId } from "./ids.ts";
import { todayIndex } from "./insights.ts";
import {
  defaultBpm,
  defaultPattern,
  defaultPatternReference,
  findRudiment,
} from "./library.ts";
import { scaleToStep } from "./timeline.ts";
import { quarterTempo } from "./timing.ts";
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

const DAILY_ROUNDS = 3;
const DAILY_MINUTES = [7, 7, 6];
const DAILY_BPM: Record<string, number> = {
  "single-stroke-roll": 80,
  "double-stroke-roll": 70,
  "triple-stroke-roll": 60,
  "single-paradiddle": 60,
  "double-paradiddle": 60,
  "triple-paradiddle": 60,
  "single-paradiddle-diddle": 60,
};

function dailyRoutine(day: string, rudimentIds: string[]): Routine {
  const id = `daily-${day.toLowerCase()}`;
  return {
    id,
    name: `${day} Practice`,
    exercises: rudimentIds.map((rudimentId, index) =>
      presetExercise(
        `${id}-e${index + 1}`,
        rudimentId,
        DAILY_ROUNDS,
        DAILY_BPM[rudimentId] ?? 60,
        DAILY_MINUTES[index] ?? 6,
      ),
    ),
  };
}

export const fallbackRoutine = dailyRoutine("Monday", [
  "single-stroke-roll",
  "double-stroke-roll",
  "single-paradiddle",
]);

export const dailyRoutines: Routine[] = [
  fallbackRoutine,
  dailyRoutine("Tuesday", [
    "triple-stroke-roll",
    "single-paradiddle",
    "double-paradiddle",
  ]),
  dailyRoutine("Wednesday", [
    "single-stroke-roll",
    "double-paradiddle",
    "single-paradiddle-diddle",
  ]),
  dailyRoutine("Thursday", [
    "double-stroke-roll",
    "triple-stroke-roll",
    "triple-paradiddle",
  ]),
  dailyRoutine("Friday", [
    "single-paradiddle",
    "triple-paradiddle",
    "single-paradiddle-diddle",
  ]),
  dailyRoutine("Saturday", [
    "single-stroke-roll",
    "double-stroke-roll",
    "double-paradiddle",
  ]),
  dailyRoutine("Sunday", [
    "triple-stroke-roll",
    "triple-paradiddle",
    "single-paradiddle-diddle",
  ]),
];

export function routineForDay(now: Date) {
  return dailyRoutines[todayIndex(now)] ?? fallbackRoutine;
}

export function findDailyRoutine(id: string | undefined) {
  return dailyRoutines.find((routine) => routine.id === id);
}

export function isDailyRoutine(id: string | undefined) {
  return findDailyRoutine(id) !== undefined;
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
