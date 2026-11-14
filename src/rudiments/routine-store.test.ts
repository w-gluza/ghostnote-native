import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "./fraction.ts";
import {
  createRoutineStore,
  PENDING_DELETION_KEY,
  ROUTINES_KEY,
} from "./routine-store.ts";
import { createSessionStore, HISTORY_KEY } from "./session-store.ts";
import type { Routine } from "./types.ts";

const tempo = { bpm: 80, pulseQuarterUnits: ONE };
const routine = (id: string): Routine => ({
  id,
  name: id,
  exercises: [
    {
      id: `${id}-e1`,
      pattern: {
        rudimentId: "single-paradiddle",
        patternId: "standard",
        patternVersion: 1,
      },
      rhythmicScale: fraction(4),
      rounds: [
        { id: `${id}-r1`, tempo, durationSeconds: 60 },
        { id: `${id}-r2`, tempo, durationSeconds: 60 },
      ],
    },
  ],
});
const practised = routine("a");
const starters = [practised, routine("b")];

function device() {
  const data = new Map<string, string>();
  const state = { failing: [] as string[] };
  const storage = {
    load: (key: string): unknown =>
      data.has(key) ? JSON.parse(data.get(key)!) : undefined,
    save(key: string, value: unknown) {
      if (state.failing.includes(key)) {
        return false;
      }
      data.set(key, JSON.stringify(value));
      return true;
    },
  };
  const open = () => {
    const sessions = createSessionStore(storage);
    const routines = createRoutineStore(storage, starters);
    const finish = (id: string) => sessions.finishSession(id, 70000);
    return { sessions, routines, finish };
  };
  return { state, storage, open };
}

function practise(app: ReturnType<ReturnType<typeof device>["open"]>) {
  const exercise = practised.exercises[0]!;
  app.sessions.trackRound(
    practised,
    exercise,
    exercise.rounds[0]!,
    { isPlaying: true, tempo, rhythmicScale: fraction(4) },
    0,
  );
  app.sessions.completeRound(practised, exercise, exercise.rounds[0]!, 60000);
}

const ids = (routines: Routine[]) => routines.map((entry) => entry.id);

test("deleting a routine moves its practice in progress into history", () => {
  const phone = device();
  const app = phone.open();
  practise(app);
  assert.equal(app.routines.remove("a", app.finish), true);
  assert.deepEqual(ids(app.routines.routines()), ["b"]);
  assert.equal(app.sessions.activeSession("a"), undefined);
  assert.equal(app.sessions.history()[0]?.activeDurationMs, 60000);
  assert.equal(phone.storage.load(PENDING_DELETION_KEY), null);
  assert.deepEqual(ids(phone.open().routines.routines()), ["b"]);
});

test("a deletion that could not be started changes nothing", () => {
  const phone = device();
  const app = phone.open();
  practise(app);
  phone.state.failing = [PENDING_DELETION_KEY];
  assert.equal(app.routines.remove("a", app.finish), false);
  assert.deepEqual(ids(app.routines.routines()), ["a", "b"]);
  assert.equal(app.sessions.history().length, 0);
  assert.equal(app.sessions.activeSession("a")?.exercises.length, 1);
});

test("a routine stays when its practice could not be saved to history", () => {
  const phone = device();
  const app = phone.open();
  practise(app);
  phone.state.failing = [HISTORY_KEY];
  assert.equal(app.routines.remove("a", app.finish), false);
  assert.deepEqual(ids(app.routines.routines()), ["a", "b"]);
  assert.equal(app.sessions.activeSession("a")?.exercises.length, 1);
  assert.equal(phone.storage.load(PENDING_DELETION_KEY), null);
});

test("when history and the undo both fail, the routine and its practice survive a restart", () => {
  const phone = device();
  const app = phone.open();
  practise(app);
  assert.equal(
    app.routines.remove("a", (id) => {
      phone.state.failing = [HISTORY_KEY, PENDING_DELETION_KEY, ROUTINES_KEY];
      return app.finish(id);
    }),
    false,
  );
  assert.deepEqual(ids(app.routines.routines()), ["a", "b"]);
  assert.equal(app.sessions.activeSession("a")?.exercises.length, 1);
  assert.equal(phone.storage.load(PENDING_DELETION_KEY), "a");

  const stillFailing = phone.open();
  assert.deepEqual(ids(stillFailing.routines.routines()), ["b"]);
  assert.equal(
    stillFailing.routines.resumeDeletion(stillFailing.finish),
    false,
  );
  assert.deepEqual(ids(stillFailing.routines.routines()), ["a", "b"]);
  assert.equal(stillFailing.sessions.activeSession("a")?.exercises.length, 1);

  phone.state.failing = [];
  const recovered = phone.open();
  assert.equal(recovered.routines.resumeDeletion(recovered.finish), true);
  assert.deepEqual(ids(recovered.routines.routines()), ["b"]);
  assert.equal(recovered.sessions.activeSession("a"), undefined);
  assert.equal(recovered.sessions.history()[0]?.activeDurationMs, 60000);
  assert.equal(phone.storage.load(PENDING_DELETION_KEY), null);
});

test("a deletion whose last write failed is completed after a restart", () => {
  const phone = device();
  const app = phone.open();
  practise(app);
  assert.equal(
    app.routines.remove("a", (id) => {
      const isFinished = app.finish(id);
      phone.state.failing = [ROUTINES_KEY];
      return isFinished;
    }),
    true,
  );
  assert.deepEqual(ids(app.routines.routines()), ["b"]);
  assert.equal(app.sessions.history().length, 1);

  phone.state.failing = [];
  const reopened = phone.open();
  assert.deepEqual(ids(reopened.routines.routines()), ["b"]);
  assert.equal(reopened.routines.resumeDeletion(reopened.finish), true);
  assert.deepEqual(ids(reopened.routines.routines()), ["b"]);
  assert.equal(reopened.sessions.history().length, 1);
  assert.equal(phone.storage.load(PENDING_DELETION_KEY), null);
});
