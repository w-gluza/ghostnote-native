import { useSyncExternalStore } from "react";

import { newId } from "./ids";
import {
  closeSession,
  recordRound,
  removeLastRound,
  startSession,
} from "./session";
import type {
  ActiveSession,
  PracticeSegment,
  PracticeSession,
  Routine,
  RoutineExercise,
  RoutineRound,
} from "./types";

let active: Record<string, ActiveSession> = {};
let history: PracticeSession[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

function timestamp() {
  return new Date().toISOString();
}

export function activeSession(routineId: string): ActiveSession | undefined {
  return active[routineId];
}

export function completeRound(
  routine: Routine,
  exercise: RoutineExercise,
  round: RoutineRound,
  played: { segments: PracticeSegment[]; activeDurationSeconds: number },
) {
  const session =
    active[routine.id] ?? startSession(routine, newId("session"), timestamp());
  active = {
    ...active,
    [routine.id]: recordRound(session, exercise, {
      id: newId("played"),
      sourceRoundId: round.id,
      segments: played.segments,
      activeDurationSeconds: played.activeDurationSeconds,
      completedAt: timestamp(),
    }),
  };
  notify();
}

export function undoRound(routineId: string, exerciseId: string) {
  const session = active[routineId];
  if (!session) {
    return;
  }
  const next = removeLastRound(session, exerciseId);
  const { [routineId]: _removed, ...rest } = active;
  active = next.exercises.length > 0 ? { ...rest, [routineId]: next } : rest;
  notify();
}

export function finishSession(routineId: string) {
  const session = active[routineId];
  if (!session) {
    return;
  }
  const { [routineId]: _finished, ...rest } = active;
  active = rest;
  history = [...history, closeSession(session, timestamp())];
  notify();
}

export function useActiveSession(routineId: string) {
  return useSyncExternalStore(subscribe, () => active[routineId]);
}

export function usePracticeHistory() {
  return useSyncExternalStore(subscribe, () => history);
}
