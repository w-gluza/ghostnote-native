import { useSyncExternalStore } from "react";

import {
  createPracticeChoiceStore,
  practiceRoutine,
} from "./practice-choice-store";
import { useSavedRoutines } from "./saved-routines";
import { quickWarmUp } from "./starter-routines";
import { load, save } from "./storage";

const store = createPracticeChoiceStore({ load, save });

export const selectPracticeRoutine = store.select;

export function usePracticeRoutine() {
  const saved = useSavedRoutines();
  const selectedId = useSyncExternalStore(store.subscribe, store.selectedId);
  return practiceRoutine(selectedId, saved, quickWarmUp);
}
