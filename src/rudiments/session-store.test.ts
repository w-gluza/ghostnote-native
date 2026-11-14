import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "./fraction.ts";
import {
  createSessionStore,
  CURRENT_KEY,
  HISTORY_KEY,
} from "./session-store.ts";
import type { Routine, RoutineExercise, Tempo } from "./types.ts";

const tempo: Tempo = { bpm: 80, pulseQuarterUnits: ONE };
const exercise = (id: string, rudimentId: string): RoutineExercise => ({
  id,
  pattern: { rudimentId, patternId: "standard", patternVersion: 1 },
  rhythmicScale: fraction(4),
  rounds: [{ id: `${id}-r1`, tempo, durationSeconds: 120 }],
});
const first = exercise("e1", "single-paradiddle");
const second = exercise("e2", "double-stroke-roll");
const routine: Routine = {
  id: "r",
  name: "Warm-up",
  exercises: [first, second],
};
const playing = { isPlaying: true, tempo, rhythmicScale: fraction(4) };
const paused = { ...playing, isPlaying: false };

function memory(failing: string[] = []) {
  const data = new Map<string, string>();
  return {
    failing,
    data,
    load: (key: string): unknown =>
      data.has(key) ? JSON.parse(data.get(key)!) : undefined,
    save(key: string, value: unknown) {
      if (this.failing.includes(key)) {
        return false;
      }
      data.set(key, JSON.stringify(value));
      return true;
    },
  };
}

test("the session starts at first playback, not at the first finished round", () => {
  const store = createSessionStore(memory());
  store.trackRound(routine, first, first.rounds[0]!, playing, 1000);
  store.completeRound(routine, first, first.rounds[0]!, 301000);
  assert.equal(
    store.activeSession("r")?.startedAt,
    new Date(1000).toISOString(),
  );
});

test("a failed history save keeps the session instead of losing it", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackRound(routine, first, first.rounds[0]!, playing, 0);
  store.completeRound(routine, first, first.rounds[0]!, 60000);

  storage.failing = [HISTORY_KEY];
  assert.equal(store.finishSession("r", 70000), false);
  assert.equal(store.history().length, 0);
  assert.equal(store.activeSession("r")?.exercises.length, 1);
  const reopened = createSessionStore(storage);
  assert.equal(reopened.activeSession("r")?.exercises.length, 1);

  storage.failing = [];
  assert.equal(store.finishSession("r", 80000), true);
  assert.equal(store.history()[0]?.activeDurationMs, 60000);
  assert.equal(store.activeSession("r"), undefined);
});

test("a session already in history is not restored as active", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackRound(routine, first, first.rounds[0]!, playing, 0);
  store.completeRound(routine, first, first.rounds[0]!, 60000);
  storage.failing = [CURRENT_KEY];
  assert.equal(store.finishSession("r", 70000), true);

  const reopened = createSessionStore(storage);
  assert.equal(reopened.history().length, 1);
  assert.equal(reopened.activeSession("r"), undefined);
});

test("uninterrupted practice is checkpointed and survives the app closing", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackRound(routine, first, first.rounds[0]!, playing, 0);
  store.checkpoint(240000);

  const reopened = createSessionStore(storage);
  reopened.completeRound(routine, first, first.rounds[0]!, 999000);
  assert.equal(
    reopened.activeSession("r")?.exercises[0]?.rounds[0]?.activeDurationMs,
    240000,
  );
});

test("a checkpoint writes nothing while nothing is playing", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackRound(routine, first, first.rounds[0]!, playing, 0);
  store.trackRound(routine, first, first.rounds[0]!, paused, 5000);
  storage.failing = [CURRENT_KEY];
  assert.equal(store.checkpoint(9000), true);
});

test("a failed save is retried at the next checkpoint even while paused", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackRound(routine, first, first.rounds[0]!, playing, 0);

  storage.failing = [CURRENT_KEY];
  store.completeRound(routine, first, first.rounds[0]!, 60000);
  assert.equal(store.checkpoint(65000), false);

  storage.failing = [];
  assert.equal(store.checkpoint(70000), true);
  const reopened = createSessionStore(storage);
  assert.equal(
    reopened.activeSession("r")?.exercises[0]?.rounds[0]?.outcome,
    "completed",
  );

  storage.failing = [CURRENT_KEY];
  assert.equal(store.checkpoint(75000), true);
});

test("leaving a round and coming back keeps its time", () => {
  const store = createSessionStore(memory());
  store.trackRound(routine, first, first.rounds[0]!, playing, 0);
  store.pauseRound("r", "e1", "e1-r1", 60000);
  store.trackRound(routine, first, first.rounds[0]!, playing, 500000);
  store.completeRound(routine, first, first.rounds[0]!, 505000);
  assert.equal(
    store.activeSession("r")?.exercises[0]?.rounds[0]?.activeDurationMs,
    65000,
  );
});

test("practice on an exercise later removed is kept as partial when the routine completes", () => {
  const store = createSessionStore(memory());
  store.trackRound(routine, second, second.rounds[0]!, playing, 0);
  store.pauseRound("r", "e2", "e2-r1", 45000);
  const edited = { ...routine, exercises: [first] };
  store.completeRound(edited, first, first.rounds[0]!, 100000);

  const exercises = store.activeSession("r")?.exercises ?? [];
  assert.deepEqual(
    exercises.map((played) => [
      played.rudimentName,
      played.rounds[0]?.outcome,
      played.rounds[0]?.activeDurationMs,
    ]),
    [
      ["Single Paradiddle", "completed", 0],
      ["Double Stroke Roll", "partial", 45000],
    ],
  );
  assert.equal(store.finishSession("r", 110000), true);
  assert.equal(store.history()[0]?.activeDurationMs, 45000);
});

test("paused practice in an unfinished round is exposed until the round is completed", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackRound(routine, first, first.rounds[0]!, playing, 1000);
  store.trackRound(routine, first, first.rounds[0]!, paused, 31000);

  const expected = [
    {
      rudimentId: "single-paradiddle",
      segments: [
        {
          startedAt: new Date(1000).toISOString(),
          tempo,
          rhythmicScale: fraction(4),
          activeDurationMs: 30000,
        },
      ],
    },
  ];
  assert.deepEqual(store.unfinished(), expected);
  assert.deepEqual(createSessionStore(storage).unfinished(), expected);

  store.completeRound(routine, first, first.rounds[0]!, 40000);
  assert.deepEqual(store.unfinished(), []);
  assert.equal(
    store.activeSession("r")?.exercises[0]?.rounds[0]?.activeDurationMs,
    30000,
  );
});

test("each stretch of playing keeps the time it started", () => {
  const store = createSessionStore(memory());
  store.trackRound(routine, first, first.rounds[0]!, playing, 1000);
  store.trackRound(routine, first, first.rounds[0]!, paused, 11000);
  store.trackRound(routine, first, first.rounds[0]!, playing, 90000000);
  store.completeRound(routine, first, first.rounds[0]!, 90005000);
  assert.deepEqual(
    store
      .activeSession("r")
      ?.exercises[0]?.rounds[0]?.segments.map((segment) => [
        segment.startedAt,
        segment.activeDurationMs,
      ]),
    [
      [new Date(1000).toISOString(), 10000],
      [new Date(90000000).toISOString(), 5000],
    ],
  );
});
