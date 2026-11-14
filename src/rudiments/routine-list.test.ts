import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "./fraction.ts";
import {
  removeWithSession,
  withoutRoutine,
  withRoutine,
} from "./routine-list.ts";
import { createSessionStore, HISTORY_KEY } from "./session-store.ts";
import type { Routine } from "./types.ts";

const routine = (id: string, name = id): Routine => ({
  id,
  name,
  exercises: [],
});
const saved = [routine("a"), routine("b"), routine("c")];
const ids = (routines: Routine[]) => routines.map((entry) => entry.id);

test("deleting a routine removes only that routine and keeps the order", () => {
  assert.deepEqual(ids(withoutRoutine(saved, "b")), ["a", "c"]);
  assert.deepEqual(ids(withoutRoutine(saved, "missing")), ["a", "b", "c"]);
  assert.deepEqual(withoutRoutine([routine("a")], "a"), []);
  assert.equal(saved.length, 3);
});

test("saving replaces a routine in place or adds a new one at the end", () => {
  assert.deepEqual(
    withRoutine(saved, routine("b", "Renamed")).map((entry) => entry.name),
    ["a", "Renamed", "c"],
  );
  assert.deepEqual(ids(withRoutine(saved, routine("d"))), ["a", "b", "c", "d"]);
});

const tempo = { bpm: 80, pulseQuarterUnits: ONE };
const practised: Routine = {
  id: "a",
  name: "a",
  exercises: [
    {
      id: "e1",
      pattern: {
        rudimentId: "single-paradiddle",
        patternId: "standard",
        patternVersion: 1,
      },
      rhythmicScale: fraction(4),
      rounds: [
        { id: "r1", tempo, durationSeconds: 60 },
        { id: "r2", tempo, durationSeconds: 60 },
      ],
    },
  ],
};

function deletion(failing: { routines?: boolean; history?: boolean }) {
  const data = new Map<string, unknown>();
  const sessions = createSessionStore({
    load: (key) => data.get(key),
    save: (key, value) => {
      if (key === HISTORY_KEY && failing.history) {
        return false;
      }
      data.set(key, value);
      return true;
    },
  });
  const exercise = practised.exercises[0]!;
  sessions.trackRound(
    practised,
    exercise,
    exercise.rounds[0]!,
    { isPlaying: true, tempo, rhythmicScale: fraction(4) },
    0,
  );
  sessions.completeRound(practised, exercise, exercise.rounds[0]!, 60000);

  let routines = [practised, routine("b")];
  const replace = (next: Routine[]) => {
    if (failing.routines) {
      return false;
    }
    routines = next;
    return true;
  };
  const previous = routines;
  const isDeleted = removeWithSession({
    remove: () => replace(withoutRoutine(previous, "a")),
    finishSession: () => sessions.finishSession("a", 70000),
    restore: () => replace(previous),
  });
  return { isDeleted, sessions, routines: () => routines };
}

test("deleting a routine moves its practice in progress into history", () => {
  const result = deletion({});
  assert.equal(result.isDeleted, true);
  assert.deepEqual(ids(result.routines()), ["b"]);
  assert.equal(result.sessions.activeSession("a"), undefined);
  assert.equal(result.sessions.history()[0]?.activeDurationMs, 60000);
});

test("a routine that could not be deleted keeps its practice in progress", () => {
  const result = deletion({ routines: true });
  assert.equal(result.isDeleted, false);
  assert.deepEqual(ids(result.routines()), ["a", "b"]);
  assert.equal(result.sessions.history().length, 0);
  assert.equal(
    result.sessions.activeSession("a")?.exercises[0]?.rounds.length,
    1,
  );
});

test("a routine is put back when its practice could not be saved to history", () => {
  const result = deletion({ history: true });
  assert.equal(result.isDeleted, false);
  assert.deepEqual(ids(result.routines()), ["a", "b"]);
  assert.equal(result.sessions.history().length, 0);
  assert.equal(
    result.sessions.activeSession("a")?.exercises[0]?.rounds.length,
    1,
  );
});
