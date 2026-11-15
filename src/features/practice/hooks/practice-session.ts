import { useSyncExternalStore } from "react";

import { deleteRoutine, resumeRoutineDeletion } from "./saved-routines";
import { createSessionStore } from "../domain/session-store";
import { load, save } from "../../../storage/storage";

const CHECKPOINT_MS = 5000;

const store = createSessionStore({ load, save });

const finishNow = (routineId: string) =>
  store.finishSession(routineId, Date.now());

let checkpoints: ReturnType<typeof setInterval> | undefined;

export function startPracticeTracking() {
  if (checkpoints !== undefined) {
    return;
  }
  resumeRoutineDeletion(finishNow);
  checkpoints = setInterval(() => store.checkpoint(Date.now()), CHECKPOINT_MS);
}

export const {
  activeSession,
  trackRound,
  rescaleRound,
  pauseRound,
  completeRound,
  undoRound,
  finishSession,
  roundPlayedMs,
  trackFree,
  rescaleFree,
  finishFree,
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
  return deleteRoutine(routineId, finishNow);
}

export function useUnfinishedPractice() {
  return useSyncExternalStore(store.subscribe, store.unfinished);
}

export function useFreePractice() {
  return useSyncExternalStore(store.subscribe, store.freeHistory);
}

export function usePracticeHistory() {
  return useSyncExternalStore(store.subscribe, store.history);
}
