import { useSyncExternalStore } from "react";

import { createRoutineStore } from "./routine-store";
import { load, save } from "./storage";
import { presetExercise, todaysRoutine } from "./todays-routine";
import type { Routine } from "./types";

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

const store = createRoutineStore({ load, save }, starterRoutines);

export const saveRoutine = store.save;
export const deleteRoutine = store.remove;
export const resumeRoutineDeletion = store.resumeDeletion;

export function useSavedRoutines() {
  return useSyncExternalStore(store.subscribe, store.routines);
}

export function useRoutine(id: string | undefined) {
  return useSyncExternalStore(store.subscribe, () => findRoutine(id));
}

export function findRoutine(id: string | undefined) {
  if (!id || id === todaysRoutine.id) {
    return todaysRoutine;
  }
  return store.routines().find((routine) => routine.id === id);
}
