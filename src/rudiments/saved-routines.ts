import { useSyncExternalStore } from "react";

import { load, save } from "./storage";
import { isRoutine, validItems } from "./stored";
import { presetExercise, todaysRoutine } from "./todays-routine";
import type { Routine } from "./types";

const ROUTINES_KEY = "routines";

const starterRoutines: Routine[] = [
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

let savedRoutines: Routine[] =
  validItems(load(ROUTINES_KEY), isRoutine) ?? starterRoutines;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function saveRoutine(routine: Routine) {
  const exists = savedRoutines.some((saved) => saved.id === routine.id);
  const next = exists
    ? savedRoutines.map((saved) => (saved.id === routine.id ? routine : saved))
    : [...savedRoutines, routine];
  if (!save(ROUTINES_KEY, next)) {
    return false;
  }
  savedRoutines = next;
  listeners.forEach((listener) => listener());
  return true;
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
