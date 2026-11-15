import type { Routine } from "./types";

type ChoiceStorage = {
  load: (key: string) => unknown;
  save: (key: string, data: unknown) => boolean;
};

export const PRACTICE_ROUTINE_KEY = "practice.routine";

export function practiceRoutine(
  selectedId: string | undefined,
  saved: Routine[],
  fallback: Routine,
) {
  return (
    saved.find((routine) => routine.id === selectedId) ??
    saved.find((routine) => routine.id === fallback.id) ??
    fallback
  );
}

export function createPracticeChoiceStore(storage: ChoiceStorage) {
  const listeners = new Set<() => void>();
  const stored = storage.load(PRACTICE_ROUTINE_KEY);
  let selectedId = typeof stored === "string" ? stored : undefined;

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    selectedId() {
      return selectedId;
    },

    select(id: string) {
      if (!storage.save(PRACTICE_ROUTINE_KEY, id)) {
        return false;
      }
      selectedId = id;
      listeners.forEach((listener) => listener());
      return true;
    },
  };
}
