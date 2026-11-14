import { useSyncExternalStore } from "react";

import { deleteRoutine } from "./saved-routines";
import { createSessionStore } from "./session-store";
import { load, save } from "./storage";

const CHECKPOINT_MS = 5000;

const store = createSessionStore({ load, save });

setInterval(() => store.checkpoint(Date.now()), CHECKPOINT_MS);

export const {
  activeSession,
  trackRound,
  rescaleRound,
  pauseRound,
  completeRound,
  undoRound,
  finishSession,
} = store;

export function useActiveSession(routineId: string) {
  return useSyncExternalStore(store.subscribe, () =>
    store.activeSession(routineId),
  );
}

export function useActiveSessions() {
  return useSyncExternalStore(store.subscribe, store.activeSessions);
}

export function removeRoutine(routineId: string) {
  return deleteRoutine(routineId, () =>
    store.finishSession(routineId, Date.now()),
  );
}

export function useUnfinishedPractice() {
  return useSyncExternalStore(store.subscribe, store.unfinished);
}

export function usePracticeHistory() {
  return useSyncExternalStore(store.subscribe, store.history);
}
