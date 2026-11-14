import { useSyncExternalStore } from "react";

import { evenRounds, todaysRoutine, type Routine } from "./todays-routine";

let savedRoutines: Routine[] = [
  {
    id: "quick-warm-up",
    name: "Quick Warm-up",
    level: 1,
    exercises: [
      { id: "single-stroke-roll", rounds: evenRounds(2, 70, 3) },
      { id: "double-stroke-roll", rounds: evenRounds(2, 60, 3) },
    ],
  },
  {
    id: "paradiddle-focus",
    name: "Paradiddle Focus",
    level: 1,
    exercises: [
      { id: "single-stroke-roll", rounds: evenRounds(2, 80, 4) },
      { id: "single-paradiddle", rounds: evenRounds(4, 70, 10) },
    ],
  },
  {
    id: "roll-builder",
    name: "Roll Builder",
    level: 2,
    exercises: [
      { id: "single-stroke-roll", rounds: evenRounds(4, 100, 8) },
      { id: "double-stroke-roll", rounds: evenRounds(4, 90, 8) },
      { id: "single-paradiddle", rounds: evenRounds(2, 80, 4) },
    ],
  },
];

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function saveRoutine(routine: Routine) {
  const exists = savedRoutines.some((saved) => saved.id === routine.id);
  savedRoutines = exists
    ? savedRoutines.map((saved) => (saved.id === routine.id ? routine : saved))
    : [...savedRoutines, routine];
  listeners.forEach((listener) => listener());
}

export function useSavedRoutines() {
  return useSyncExternalStore(subscribe, () => savedRoutines);
}

export function useRoutine(id: string | undefined) {
  return useSyncExternalStore(subscribe, () => findRoutine(id));
}

export function findRoutine(id: string | undefined) {
  if (!id || id === todaysRoutine.id) {
    return todaysRoutine;
  }
  return savedRoutines.find((routine) => routine.id === id);
}
