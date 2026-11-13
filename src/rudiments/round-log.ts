import { useSyncExternalStore } from "react";

const roundsDone = new Map<string, number>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function logRound(exerciseId: string, rounds: number) {
  const done = roundsDone.get(exerciseId) ?? 0;
  roundsDone.set(exerciseId, Math.min(rounds, done + 1));
  listeners.forEach((listener) => listener());
}

export function undoRound(exerciseId: string) {
  const done = roundsDone.get(exerciseId) ?? 0;
  roundsDone.set(exerciseId, Math.max(0, done - 1));
  listeners.forEach((listener) => listener());
}

export function useRoundsDone(exerciseId: string) {
  return useSyncExternalStore(subscribe, () => roundsDone.get(exerciseId) ?? 0);
}
