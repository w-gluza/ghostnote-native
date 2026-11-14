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
import { load, save } from "./storage";
import {
  isActiveSession,
  isPatternReference,
  isPracticeSession,
  isSegment,
  validItems,
} from "./stored";
import { isFields, isName } from "./validate";
import type {
  ActiveSession,
  Fraction,
  PracticeSegment,
  PracticeSession,
  Routine,
  RoutineExercise,
  RoutineRound,
} from "./types";

type TrackedRound = {
  routineId: string;
  exercise: Pick<RoutineExercise, "id" | "pattern">;
  rudimentName: string;
  roundId: string;
  tracker: RoundTracker;
};

type StoredTrackedRound = Omit<TrackedRound, "tracker"> & {
  segments: PracticeSegment[];
};

const ACTIVE_KEY = "sessions.active";
const HISTORY_KEY = "sessions.history";
const TRACKED_KEY = "sessions.unfinished";

function isStoredTrackedRound(value: unknown): value is StoredTrackedRound {
  return (
    isFields(value) &&
    isName(value.routineId) &&
    isFields(value.exercise) &&
    isName(value.exercise.id) &&
    isPatternReference(value.exercise.pattern) &&
    isName(value.rudimentName) &&
    isName(value.roundId) &&
    Array.isArray(value.segments) &&
    value.segments.every(isSegment)
  );
}

let active: Record<string, ActiveSession> = Object.fromEntries(
  (validItems(load(ACTIVE_KEY), isActiveSession) ?? []).flatMap((session) =>
    session.routineId ? [[session.routineId, session]] : [],
  ),
);
let history: PracticeSession[] =
  validItems(load(HISTORY_KEY), isPracticeSession) ?? [];
const tracked = new Map<string, TrackedRound>(
  (validItems(load(TRACKED_KEY), isStoredTrackedRound) ?? [])
    .filter((entry) => active[entry.routineId] !== undefined)
    .map(({ segments, ...entry }) => [
      trackerKey(entry.routineId, entry.exercise.id, entry.roundId),
      { ...entry, tracker: { segments } },
    ]),
);

function saveActive() {
  save(ACTIVE_KEY, Object.values(active));
}

function saveTracked(now: number) {
  save(
    TRACKED_KEY,
    [...tracked.values()].map(({ tracker, ...entry }) => ({
      ...entry,
      segments: pauseTracking(tracker, now).segments,
    })),
  );
}

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
  saveActive();
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
  saveTracked(now);
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

function retrackAndSave(
  key: string,
  now: number,
  change: (tracker: RoundTracker) => RoundTracker,
) {
  retrack(key, change);
  saveTracked(now);
}

export function rescaleRound(
  routineId: string,
  exerciseId: string,
  roundId: string,
  rhythmicScale: Fraction,
  now: number,
) {
  retrackAndSave(trackerKey(routineId, exerciseId, roundId), now, (tracker) =>
    rescaleTracking(tracker, rhythmicScale, now),
  );
}

export function pauseRound(
  routineId: string,
  exerciseId: string,
  roundId: string,
  now: number,
) {
  retrackAndSave(trackerKey(routineId, exerciseId, roundId), now, (tracker) =>
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
  saveActive();
  saveTracked(now);
  notify();
}

export function undoRound(routineId: string, exerciseId: string) {
  const session = active[routineId];
  if (!session) {
    return;
  }
  active = { ...active, [routineId]: removeLastRound(session, exerciseId) };
  saveActive();
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
  saveActive();
  saveTracked(now);
  save(HISTORY_KEY, history);
  notify();
}

export function useActiveSession(routineId: string) {
  return useSyncExternalStore(subscribe, () => active[routineId]);
}

export function usePracticeHistory() {
  return useSyncExternalStore(subscribe, () => history);
}
