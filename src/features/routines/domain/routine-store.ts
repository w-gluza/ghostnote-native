import { withoutRoutine, withRoutine } from "./routine-list.ts";
import { isRoutine } from "./stored.ts";
import { validItems } from "../../../storage/validators.ts";
import type { Routine } from "./types";

type RoutineStorage = {
  load: (key: string) => unknown;
  save: (key: string, data: unknown) => boolean;
};

type FinishSession = (routineId: string) => boolean;

export const ROUTINES_KEY = "routines";
export const PENDING_DELETION_KEY = "routines.pendingDeletion";

export function createRoutineStore(
  storage: RoutineStorage,
  starters: Routine[],
) {
  const listeners = new Set<() => void>();
  let saved = validItems(storage.load(ROUTINES_KEY), isRoutine) ?? starters;
  const storedPending = storage.load(PENDING_DELETION_KEY);
  let pending = typeof storedPending === "string" ? storedPending : undefined;
  let isMarkerStored = pending !== undefined;
  let visible = pending ? withoutRoutine(saved, pending) : saved;

  const refresh = () => {
    visible = pending ? withoutRoutine(saved, pending) : saved;
    listeners.forEach((listener) => listener());
  };

  const clearMarker = () => {
    if (isMarkerStored && storage.save(PENDING_DELETION_KEY, null)) {
      isMarkerStored = false;
    }
  };

  const settle = (finishSession: FinishSession) => {
    if (!pending) {
      return true;
    }
    const id = pending;
    pending = undefined;
    if (!finishSession(id)) {
      clearMarker();
      refresh();
      return false;
    }
    saved = withoutRoutine(saved, id);
    if (storage.save(ROUTINES_KEY, saved)) {
      clearMarker();
    }
    refresh();
    return true;
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    routines() {
      return visible;
    },

    save(routine: Routine) {
      const next = withRoutine(saved, routine);
      if (!storage.save(ROUTINES_KEY, next)) {
        return false;
      }
      saved = next;
      clearMarker();
      refresh();
      return true;
    },

    remove(id: string, finishSession: FinishSession) {
      if (!storage.save(PENDING_DELETION_KEY, id)) {
        return false;
      }
      isMarkerStored = true;
      pending = id;
      return settle(finishSession);
    },

    resumeDeletion(finishSession: FinishSession) {
      return settle(finishSession);
    },
  };
}
