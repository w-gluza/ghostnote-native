import { useSyncExternalStore } from "react";

import { presetExercise, todaysRoutine } from "./todays-routine";
import type { Routine } from "./types";

let savedRoutines: Routine[] = [
  {
    id: "quick-warm-up",
    name: "Quick Warm-up",
    exercises: [
      presetExercise("quick-warm-up-e1", "single-stroke-roll", 2, 70, 3),
      presetExercise("quick-warm-up-e2", "double-stroke-roll", 2, 60, 3),
    ],
  },
  {
    id: "paradiddle-focus",
    name: "Paradiddle Focus",
    exercises: [
      presetExercise("paradiddle-focus-e1", "single-stroke-roll", 2, 80, 4),
      presetExercise("paradiddle-focus-e2", "single-paradiddle", 4, 70, 10),
    ],
  },
  {
    id: "roll-builder",
    name: "Roll Builder",
    exercises: [
      presetExercise("roll-builder-e1", "single-stroke-roll", 4, 100, 8),
      presetExercise("roll-builder-e2", "double-stroke-roll", 4, 90, 8),
      presetExercise("roll-builder-e3", "single-paradiddle", 2, 80, 4),
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
