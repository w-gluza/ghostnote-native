import { newId } from "../../rudiments/domain/ids.ts";
import { findRudiment } from "../../rudiments/domain/library.ts";
import {
  finishTracking,
  idleTracker,
  pauseTracking,
  rescaleTracking,
  trackActivity,
  type Activity,
  type RoundTracker,
} from "./round-tracker.ts";
import {
  closeSession,
  isRoutineComplete,
  recordRound,
  removeLastRound,
  startSession,
} from "./session.ts";
import {
  isActiveSession,
  isOptionalExerciseKind,
  isPracticeSession,
  isSegment,
} from "./stored.ts";
import {
  isPatternReference,
  isFields,
  isName,
} from "../../rudiments/domain/validate.ts";
import { validItems } from "../../../storage/validators.ts";
import type {
  ActiveSession,
  ExerciseKind,
  PracticeSegment,
  PracticeSession,
} from "./types";
import type { Fraction, PatternReference } from "../../rudiments/domain/types";
import type {
  Routine,
  RoutineExercise,
  RoutineRound,
} from "../../routines/domain/types";

export type KeyValueStorage = {
  load: (key: string) => unknown;
  save: (key: string, data: unknown) => boolean;
};

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

type FreeTracked = {
  id: string;
  kind?: ExerciseKind;
  pattern: PatternReference;
  rudimentName: string;
  tracker: RoundTracker;
};

type StoredFreeTracked = Omit<FreeTracked, "tracker"> & {
  segments: PracticeSegment[];
};

export type UnfinishedPractice = {
  rudimentId: string;
  segments: PracticeSegment[];
};

export const CURRENT_KEY = "sessions.current";
export const HISTORY_KEY = "sessions.history";
export const FREE_KEY = "sessions.free";

function isStoredFreeTracked(value: unknown): value is StoredFreeTracked {
  return (
    isFields(value) &&
    isName(value.id) &&
    isOptionalExerciseKind(value.kind) &&
    isPatternReference(value.pattern) &&
    isName(value.rudimentName) &&
    Array.isArray(value.segments) &&
    value.segments.every(isSegment)
  );
}

function endOf(segments: PracticeSegment[]) {
  const last = segments.at(-1);
  return last?.startedAt
    ? timestamp(Date.parse(last.startedAt) + last.activeDurationMs)
    : timestamp(0);
}

function freeSession(
  entry: FreeTracked,
  played: { segments: PracticeSegment[]; activeDurationMs: number },
  completedAt: string,
): PracticeSession {
  return {
    id: entry.id,
    kind: "free",
    startedAt: played.segments[0]?.startedAt ?? completedAt,
    completedAt,
    activeDurationMs: played.activeDurationMs,
    exercises: [
      {
        ...(entry.kind ? { kind: entry.kind } : {}),
        rudimentName: entry.rudimentName,
        pattern: entry.pattern,
        rounds: [
          {
            id: newId("played"),
            outcome: "completed",
            segments: played.segments,
            activeDurationMs: played.activeDurationMs,
            completedAt,
          },
        ],
      },
    ],
  };
}

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

function timestamp(now: number) {
  return new Date(now).toISOString();
}

function trackerKey(routineId: string, exerciseId: string, roundId: string) {
  return `${routineId}/${exerciseId}/${roundId}`;
}

function nameOf(exercise: Pick<RoutineExercise, "pattern">) {
  return (
    findRudiment(exercise.pattern.rudimentId)?.name ??
    exercise.pattern.rudimentId
  );
}

export function createSessionStore(storage: KeyValueStorage) {
  const listeners = new Set<() => void>();
  let history: PracticeSession[] =
    validItems(storage.load(HISTORY_KEY), isPracticeSession) ?? [];

  const current = storage.load(CURRENT_KEY);
  const finishedIds = new Set(history.map((session) => session.id));
  let active: Record<string, ActiveSession> = Object.fromEntries(
    (
      validItems(
        isFields(current) ? current.active : undefined,
        isActiveSession,
      ) ?? []
    ).flatMap((session) =>
      session.routineId && !finishedIds.has(session.id)
        ? [[session.routineId, session]]
        : [],
    ),
  );
  const tracked = new Map<string, TrackedRound>(
    (
      validItems(
        isFields(current) ? current.unfinished : undefined,
        isStoredTrackedRound,
      ) ?? []
    )
      .filter((entry) => active[entry.routineId] !== undefined)
      .map(({ segments, ...entry }) => [
        trackerKey(entry.routineId, entry.exercise.id, entry.roundId),
        { ...entry, tracker: { segments } },
      ]),
  );

  let freeHistory: PracticeSession[] =
    validItems(storage.load(FREE_KEY), isPracticeSession) ?? [];
  const savedFreeIds = new Set(freeHistory.map((session) => session.id));
  const freeTracked = new Map<string, FreeTracked>(
    (
      validItems(
        isFields(current) ? current.free : undefined,
        isStoredFreeTracked,
      ) ?? []
    )
      .filter((entry) => !savedFreeIds.has(entry.id))
      .map(({ segments, ...entry }) => [
        entry.pattern.rudimentId,
        { ...entry, tracker: { segments } },
      ]),
  );

  const notify = () => listeners.forEach((listener) => listener());

  let hasUnsavedChanges = false;
  let unfinished: UnfinishedPractice[] = [];

  const refreshUnfinished = () => {
    unfinished = [
      ...[...tracked.values()].map((entry) => ({
        rudimentId: entry.exercise.pattern.rudimentId,
        segments: entry.tracker.segments,
      })),
      ...[...freeTracked.values()].map((entry) => ({
        rudimentId: entry.pattern.rudimentId,
        segments: entry.tracker.segments,
      })),
    ];
  };

  const saveCurrent = (now: number) => {
    const isSaved = storage.save(CURRENT_KEY, {
      active: Object.values(active),
      unfinished: [...tracked.values()].map(({ tracker, ...entry }) => ({
        ...entry,
        segments: pauseTracking(tracker, now).segments,
      })),
      free: [...freeTracked.values()].map(({ tracker, ...entry }) => ({
        ...entry,
        segments: pauseTracking(tracker, now).segments,
      })),
    });
    hasUnsavedChanges = !isSaved;
    return isSaved;
  };

  const saveFree = (
    rudimentId: string,
    played: { segments: PracticeSegment[]; activeDurationMs: number },
    completedAt: string,
  ) => {
    const entry = freeTracked.get(rudimentId);
    if (!entry) {
      return true;
    }
    if (played.activeDurationMs > 0) {
      const next = [...freeHistory, freeSession(entry, played, completedAt)];
      if (!storage.save(FREE_KEY, next)) {
        freeTracked.set(rudimentId, {
          ...entry,
          tracker: { segments: played.segments },
        });
        return false;
      }
      freeHistory = next;
    }
    freeTracked.delete(rudimentId);
    return true;
  };

  for (const [rudimentId, entry] of [...freeTracked]) {
    const segments = entry.tracker.segments;
    saveFree(
      rudimentId,
      {
        segments,
        activeDurationMs: segments.reduce(
          (total, segment) => total + segment.activeDurationMs,
          0,
        ),
      },
      endOf(segments),
    );
  }
  refreshUnfinished();

  const ensureSession = (routine: Routine, now: number) => {
    const existing = active[routine.id];
    if (existing) {
      return existing;
    }
    const session = startSession(routine, newId("session"), timestamp(now));
    active = { ...active, [routine.id]: session };
    return session;
  };

  const settled = (routineId: string, now: number) => {
    let session = active[routineId];
    const keys: string[] = [];
    for (const [key, entry] of tracked) {
      if (entry.routineId !== routineId) {
        continue;
      }
      keys.push(key);
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
    return { session, keys };
  };

  const retrack = (
    key: string,
    now: number,
    change: (tracker: RoundTracker) => RoundTracker,
  ) => {
    const entry = tracked.get(key);
    if (entry) {
      tracked.set(key, { ...entry, tracker: change(entry.tracker) });
      saveCurrent(now);
      refreshUnfinished();
      notify();
    }
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    activeSession(routineId: string): ActiveSession | undefined {
      return active[routineId];
    },

    activeSessions() {
      return active;
    },

    history() {
      return history;
    },

    unfinished() {
      return unfinished;
    },

    freeHistory() {
      return freeHistory;
    },

    trackFree(
      pattern: PatternReference,
      activity: Activity,
      now: number,
      exercise?: { kind: ExerciseKind; name: string },
    ) {
      const entry = freeTracked.get(pattern.rudimentId);
      if (!activity.isPlaying && !entry) {
        return;
      }
      freeTracked.set(pattern.rudimentId, {
        id: entry?.id ?? newId("session"),
        ...(exercise ? { kind: exercise.kind } : {}),
        pattern,
        rudimentName: exercise?.name ?? nameOf({ pattern }),
        tracker: trackActivity(entry?.tracker ?? idleTracker, activity, now),
      });
      saveCurrent(now);
      refreshUnfinished();
      notify();
    },

    rescaleFree(rudimentId: string, rhythmicScale: Fraction, now: number) {
      const entry = freeTracked.get(rudimentId);
      if (entry) {
        freeTracked.set(rudimentId, {
          ...entry,
          tracker: rescaleTracking(entry.tracker, rhythmicScale, now),
        });
        saveCurrent(now);
        refreshUnfinished();
        notify();
      }
    },

    finishFree(rudimentId: string, now: number) {
      const entry = freeTracked.get(rudimentId);
      if (!entry) {
        return true;
      }
      const isSaved = saveFree(
        rudimentId,
        finishTracking(entry.tracker, now),
        timestamp(now),
      );
      saveCurrent(now);
      refreshUnfinished();
      notify();
      return isSaved;
    },

    roundPlayedMs(
      routineId: string,
      exerciseId: string,
      roundId: string,
      now: number,
    ) {
      const entry = tracked.get(trackerKey(routineId, exerciseId, roundId));
      return entry ? finishTracking(entry.tracker, now).activeDurationMs : 0;
    },

    trackRound(
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
      ensureSession(routine, now);
      tracked.set(key, {
        routineId: routine.id,
        exercise: { id: exercise.id, pattern: exercise.pattern },
        rudimentName: nameOf(exercise),
        roundId: round.id,
        tracker: trackActivity(entry?.tracker ?? idleTracker, activity, now),
      });
      saveCurrent(now);
      refreshUnfinished();
      notify();
    },

    rescaleRound(
      routineId: string,
      exerciseId: string,
      roundId: string,
      rhythmicScale: Fraction,
      now: number,
    ) {
      retrack(trackerKey(routineId, exerciseId, roundId), now, (tracker) =>
        rescaleTracking(tracker, rhythmicScale, now),
      );
    },

    pauseRound(
      routineId: string,
      exerciseId: string,
      roundId: string,
      now: number,
    ) {
      retrack(trackerKey(routineId, exerciseId, roundId), now, (tracker) =>
        pauseTracking(tracker, now),
      );
    },

    checkpoint(now: number) {
      const isPlaying = [...tracked.values(), ...freeTracked.values()].some(
        (entry) => entry.tracker.open !== undefined,
      );
      return isPlaying || hasUnsavedChanges ? saveCurrent(now) : true;
    },

    completeRound(
      routine: Routine,
      exercise: RoutineExercise,
      round: RoutineRound,
      now: number,
    ) {
      const key = trackerKey(routine.id, exercise.id, round.id);
      const played = finishTracking(
        tracked.get(key)?.tracker ?? idleTracker,
        now,
      );
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
        const result = settled(routine.id, now);
        result.keys.forEach((settledKey) => tracked.delete(settledKey));
        if (result.session) {
          active = { ...active, [routine.id]: result.session };
        }
      }
      saveCurrent(now);
      refreshUnfinished();
      notify();
    },

    undoRound(routineId: string, exerciseId: string, now: number) {
      const session = active[routineId];
      if (!session) {
        return;
      }
      active = {
        ...active,
        [routineId]: removeLastRound(session, exerciseId),
      };
      saveCurrent(now);
      notify();
    },

    finishSession(routineId: string, now: number) {
      const result = settled(routineId, now);
      if (!result.session) {
        return true;
      }
      const nextHistory = [
        ...history,
        closeSession(result.session, timestamp(now)),
      ];
      if (!storage.save(HISTORY_KEY, nextHistory)) {
        return false;
      }
      history = nextHistory;
      result.keys.forEach((key) => tracked.delete(key));
      const { [routineId]: _finished, ...rest } = active;
      active = rest;
      saveCurrent(now);
      refreshUnfinished();
      notify();
      return true;
    },
  };
}
