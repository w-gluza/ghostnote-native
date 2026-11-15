import { useSyncExternalStore } from "react";

import { createRoutineStore } from "./routine-store";
import { load, save } from "./storage";
import { quickWarmUp, starterRoutines } from "./starter-routines";

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
  return (
    store.routines().find((routine) => routine.id === id) ??
    (id === quickWarmUp.id ? quickWarmUp : undefined)
  );
}
