import { useSyncExternalStore } from "react";

import type { Routine } from "./todays-routine";

const roundsDone = new Map<string, number>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

function keyOf(routineId: string, exerciseId: string) {
  return `${routineId}/${exerciseId}`;
}

function doneIn(routineId: string, exerciseId: string) {
  return roundsDone.get(keyOf(routineId, exerciseId)) ?? 0;
}

export function logRound(
  routineId: string,
  exerciseId: string,
  rounds: number,
) {
  const done = doneIn(routineId, exerciseId);
  roundsDone.set(keyOf(routineId, exerciseId), Math.min(rounds, done + 1));
  notify();
}

export function undoRound(routineId: string, exerciseId: string) {
  const done = doneIn(routineId, exerciseId);
  roundsDone.set(keyOf(routineId, exerciseId), Math.max(0, done - 1));
  notify();
}

export function willCompleteRoutine(routine: Routine, exerciseId: string) {
  return routine.exercises.every((exercise) => {
    const done = doneIn(routine.id, exercise.id);
    return (
      (exercise.id === exerciseId ? done + 1 : done) >= exercise.rounds.length
    );
  });
}

export function clearRounds(routine: Routine) {
  routine.exercises.forEach((exercise) => {
    roundsDone.delete(keyOf(routine.id, exercise.id));
  });
  notify();
}

export function useRoundsDone(routineId: string, exerciseId: string) {
  return useSyncExternalStore(subscribe, () => doneIn(routineId, exerciseId));
}

export function useRoutineComplete(routine: Routine) {
  return useSyncExternalStore(subscribe, () =>
    routine.exercises.every(
      (exercise) => doneIn(routine.id, exercise.id) >= exercise.rounds.length,
    ),
  );
}
