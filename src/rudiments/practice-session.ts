import { useSyncExternalStore } from "react";

import { newId } from "./ids";
import { findRudiment } from "./library";
import {
  finishTracking,
  idleTracker,
  pauseTracking,
  trackActivity,
  type Activity,
  type RoundTracker,
} from "./round-tracker";
import {
  closeSession,
  recordRound,
  removeLastRound,
  startSession,
} from "./session";
import type {
  ActiveSession,
  PracticeSession,
  Routine,
  RoutineExercise,
  RoutineRound,
} from "./types";

let active: Record<string, ActiveSession> = {};
let history: PracticeSession[] = [];
const trackers = new Map<string, RoundTracker>();
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

function timestamp(now: number) {
  return new Date(now).toISOString();
}

function trackerKey(routineId: string, exerciseId: string, roundId: string) {
  return `${routineId}/${exerciseId}/${roundId}`;
}

function ensureSession(routine: Routine, now: number) {
  const existing = active[routine.id];
  if (existing) {
    return existing;
  }
  const session = startSession(routine, newId("session"), timestamp(now));
  active = { ...active, [routine.id]: session };
  return session;
}

export function activeSession(routineId: string): ActiveSession | undefined {
  return active[routineId];
}

export function trackRound(
  routine: Routine,
  exercise: RoutineExercise,
  round: RoutineRound,
  activity: Activity,
  now: number,
) {
  const key = trackerKey(routine.id, exercise.id, round.id);
  const tracker = trackers.get(key) ?? idleTracker;
  if (!activity.isPlaying && tracker === idleTracker) {
    return;
  }
  const isNewSession = active[routine.id] === undefined;
  ensureSession(routine, now);
  trackers.set(key, trackActivity(tracker, activity, now));
  if (isNewSession) {
    notify();
  }
}

export function pauseRound(
  routineId: string,
  exerciseId: string,
  roundId: string,
  now: number,
) {
  const key = trackerKey(routineId, exerciseId, roundId);
  const tracker = trackers.get(key);
  if (tracker) {
    trackers.set(key, pauseTracking(tracker, now));
  }
}

export function completeRound(
  routine: Routine,
  exercise: RoutineExercise,
  round: RoutineRound,
  now: number,
) {
  const key = trackerKey(routine.id, exercise.id, round.id);
  const played = finishTracking(trackers.get(key) ?? idleTracker, now);
  trackers.delete(key);
  const session = ensureSession(routine, now);
  const rudimentName =
    findRudiment(exercise.pattern.rudimentId)?.name ??
    exercise.pattern.rudimentId;
  active = {
    ...active,
    [routine.id]: recordRound(session, exercise, rudimentName, {
      id: newId("played"),
      sourceRoundId: round.id,
      segments: played.segments,
      activeDurationMs: played.activeDurationMs,
      completedAt: timestamp(now),
    }),
  };
  notify();
}

export function undoRound(routineId: string, exerciseId: string) {
  const session = active[routineId];
  if (!session) {
    return;
  }
  active = { ...active, [routineId]: removeLastRound(session, exerciseId) };
  notify();
}

export function finishSession(routineId: string, now: number) {
  const session = active[routineId];
  if (!session) {
    return;
  }
  const { [routineId]: _finished, ...rest } = active;
  active = rest;
  for (const key of [...trackers.keys()]) {
    if (key.startsWith(`${routineId}/`)) {
      trackers.delete(key);
    }
  }
  history = [...history, closeSession(session, timestamp(now))];
  notify();
}

export function useActiveSession(routineId: string) {
  return useSyncExternalStore(subscribe, () => active[routineId]);
}

export function usePracticeHistory() {
  return useSyncExternalStore(subscribe, () => history);
}
