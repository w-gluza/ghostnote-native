import { useSyncExternalStore } from "react";

import { newId } from "./ids";
import { findRudiment } from "./library";
import {
  finishTracking,
  idleTracker,
  pauseTracking,
  rescaleTracking,
  trackActivity,
  type Activity,
  type RoundTracker,
} from "./round-tracker";
import {
  closeSession,
  isRoutineComplete,
  recordRound,
  removeLastRound,
  startSession,
} from "./session";
import type {
  ActiveSession,
  Fraction,
  PracticeSession,
  Routine,
  RoutineExercise,
  RoutineRound,
} from "./types";

let active: Record<string, ActiveSession> = {};
let history: PracticeSession[] = [];
type TrackedRound = {
  routineId: string;
  exercise: Pick<RoutineExercise, "id" | "pattern">;
  rudimentName: string;
  roundId: string;
  tracker: RoundTracker;
};

const tracked = new Map<string, TrackedRound>();
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

function nameOf(exercise: Pick<RoutineExercise, "pattern">) {
  return (
    findRudiment(exercise.pattern.rudimentId)?.name ??
    exercise.pattern.rudimentId
  );
}

function settleUnfinished(routineId: string, now: number) {
  let session = active[routineId];
  for (const [key, entry] of [...tracked]) {
    if (entry.routineId !== routineId) {
      continue;
    }
    tracked.delete(key);
    const played = finishTracking(entry.tracker, now);
    if (!session || played.activeDurationMs === 0) {
      continue;
    }
    session = recordRound(session, entry.exercise, entry.rudimentName, {
      id: newId("played"),
      sourceRoundId: entry.roundId,
      outcome: "partial",
      segments: played.segments,
      activeDurationMs: played.activeDurationMs,
      completedAt: timestamp(now),
    });
  }
  if (session) {
    active = { ...active, [routineId]: session };
  }
}

export function trackRound(
  routine: Routine,
  exercise: RoutineExercise,
  round: RoutineRound,
  activity: Activity,
  now: number,
) {
  const key = trackerKey(routine.id, exercise.id, round.id);
  const entry = tracked.get(key);
  if (!activity.isPlaying && !entry) {
    return;
  }
  const isNewSession = active[routine.id] === undefined;
  ensureSession(routine, now);
  tracked.set(key, {
    routineId: routine.id,
    exercise: { id: exercise.id, pattern: exercise.pattern },
    rudimentName: nameOf(exercise),
    roundId: round.id,
    tracker: trackActivity(entry?.tracker ?? idleTracker, activity, now),
  });
  if (isNewSession) {
    notify();
  }
}

function retrack(key: string, change: (tracker: RoundTracker) => RoundTracker) {
  const entry = tracked.get(key);
  if (entry) {
    tracked.set(key, { ...entry, tracker: change(entry.tracker) });
  }
}

export function rescaleRound(
  routineId: string,
  exerciseId: string,
  roundId: string,
  rhythmicScale: Fraction,
  now: number,
) {
  retrack(trackerKey(routineId, exerciseId, roundId), (tracker) =>
    rescaleTracking(tracker, rhythmicScale, now),
  );
}

export function pauseRound(
  routineId: string,
  exerciseId: string,
  roundId: string,
  now: number,
) {
  retrack(trackerKey(routineId, exerciseId, roundId), (tracker) =>
    pauseTracking(tracker, now),
  );
}

export function completeRound(
  routine: Routine,
  exercise: RoutineExercise,
  round: RoutineRound,
  now: number,
) {
  const key = trackerKey(routine.id, exercise.id, round.id);
  const played = finishTracking(tracked.get(key)?.tracker ?? idleTracker, now);
  tracked.delete(key);
  const session = recordRound(
    ensureSession(routine, now),
    exercise,
    nameOf(exercise),
    {
      id: newId("played"),
      sourceRoundId: round.id,
      outcome: "completed",
      segments: played.segments,
      activeDurationMs: played.activeDurationMs,
      completedAt: timestamp(now),
    },
  );
  active = { ...active, [routine.id]: session };
  if (isRoutineComplete(session, routine)) {
    settleUnfinished(routine.id, now);
  }
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
  if (!active[routineId]) {
    return;
  }
  const session = active[routineId];
  settleUnfinished(routineId, now);
  const { [routineId]: settled = session, ...rest } = active;
  active = rest;
  history = [...history, closeSession(settled, timestamp(now))];
  notify();
}

export function useActiveSession(routineId: string) {
  return useSyncExternalStore(subscribe, () => active[routineId]);
}

export function usePracticeHistory() {
  return useSyncExternalStore(subscribe, () => history);
}
