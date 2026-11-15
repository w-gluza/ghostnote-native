import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "../../rudiments/domain/fraction.ts";
import {
  createSessionStore,
  CURRENT_KEY,
  FREE_KEY,
  HISTORY_KEY,
} from "./session-store.ts";
import type {
  Routine,
  RoutineExercise,
  Tempo,
} from "../../rudiments/domain/types.ts";

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

test("the round clock counts playing time only and carries on after a pause", () => {
  const store = createSessionStore(memory());
  const round = first.rounds[0]!;
  assert.equal(store.roundPlayedMs("r", "e1", round.id, 500), 0);
  store.trackRound(routine, first, round, playing, 1000);
  assert.equal(store.roundPlayedMs("r", "e1", round.id, 21000), 20000);
  store.trackRound(routine, first, round, paused, 31000);
  assert.equal(store.roundPlayedMs("r", "e1", round.id, 90000), 30000);
  store.trackRound(routine, first, round, playing, 100000);
  assert.equal(store.roundPlayedMs("r", "e1", round.id, 105000), 35000);
  store.completeRound(routine, first, round, 105000);
  assert.equal(store.roundPlayedMs("r", "e1", round.id, 110000), 0);
});

test("switching to another routine keeps the unfinished progress of both", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  const other: Routine = { ...routine, id: "other", name: "Other" };
  store.trackRound(routine, first, first.rounds[0]!, playing, 0);
  store.completeRound(routine, first, first.rounds[0]!, 60000);
  store.trackRound(other, second, second.rounds[0]!, playing, 70000);
  store.completeRound(other, second, second.rounds[0]!, 100000);

  assert.equal(store.activeSession("r")?.exercises.length, 1);
  assert.equal(store.activeSession("other")?.exercises.length, 1);
  const reopened = createSessionStore(storage);
  assert.equal(
    reopened.activeSession("r")?.exercises[0]?.sourceExerciseId,
    "e1",
  );
  assert.equal(
    reopened.activeSession("other")?.exercises[0]?.sourceExerciseId,
    "e2",
  );
});

test("after finishing, the same routine starts a fresh session and history is kept", () => {
  const store = createSessionStore(memory());
  store.trackRound(routine, first, first.rounds[0]!, playing, 0);
  store.completeRound(routine, first, first.rounds[0]!, 60000);
  assert.equal(store.finishSession("r", 70000), true);
  assert.equal(store.activeSession("r"), undefined);

  store.trackRound(routine, first, first.rounds[0]!, playing, 100000);
  store.completeRound(routine, first, first.rounds[0]!, 130000);
  assert.equal(
    store.activeSession("r")?.startedAt,
    new Date(100000).toISOString(),
  );
  assert.equal(store.activeSession("r")?.exercises.length, 1);
  assert.equal(store.history().length, 1);
  assert.equal(store.history()[0]?.activeDurationMs, 60000);
});

const paradiddle = first.pattern;

test("free practice is saved on its own when the drummer leaves, apart from routine sessions", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackFree(paradiddle, playing, 1000);
  store.trackFree(paradiddle, paused, 31000);
  assert.equal(store.finishFree("single-paradiddle", 40000), true);

  assert.equal(store.history().length, 0);
  const [saved] = store.freeHistory();
  assert.equal(saved?.kind, "free");
  assert.equal(saved?.routineId, undefined);
  assert.equal(saved?.activeDurationMs, 30000);
  assert.equal(saved?.startedAt, new Date(1000).toISOString());
  assert.equal(saved?.exercises[0]?.rudimentName, "Single Paradiddle");
  assert.equal(store.unfinished().length, 0);
  assert.equal(createSessionStore(storage).freeHistory().length, 1);
});

test("leaving while still playing counts the time up to that moment", () => {
  const store = createSessionStore(memory());
  store.trackFree(paradiddle, playing, 0);
  store.finishFree("single-paradiddle", 12000);
  assert.equal(store.freeHistory()[0]?.activeDurationMs, 12000);
});

test("opening a rudiment without playing saves nothing", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackFree(paradiddle, paused, 0);
  assert.equal(store.finishFree("single-paradiddle", 5000), true);
  assert.equal(store.freeHistory().length, 0);
  assert.equal(storage.data.has(FREE_KEY), false);
});

test("free practice shows as played time while the drummer is still on the screen", () => {
  const store = createSessionStore(memory());
  store.trackFree(paradiddle, playing, 0);
  store.trackFree(paradiddle, paused, 20000);
  assert.deepEqual(
    store
      .unfinished()
      .map((entry) => [entry.rudimentId, entry.segments[0]?.activeDurationMs]),
    [["single-paradiddle", 20000]],
  );
});

test("free practice interrupted by the app closing is saved once at the next launch", () => {
  const storage = memory();
  const store = createSessionStore(storage);
  store.trackFree(paradiddle, playing, 0);
  store.checkpoint(15000);

  const reopened = createSessionStore(storage);
  assert.equal(reopened.freeHistory().length, 1);
  assert.equal(reopened.freeHistory()[0]?.activeDurationMs, 15000);
  assert.equal(
    reopened.freeHistory()[0]?.completedAt,
    new Date(15000).toISOString(),
  );
  assert.equal(createSessionStore(storage).freeHistory().length, 1);
});

test("free practice that cannot be saved is kept and saved on a later attempt", () => {
  const storage = memory([FREE_KEY]);
  const store = createSessionStore(storage);
  store.trackFree(paradiddle, playing, 0);
  assert.equal(store.finishFree("single-paradiddle", 10000), false);
  assert.equal(store.freeHistory().length, 0);
  assert.equal(store.unfinished()[0]?.segments[0]?.activeDurationMs, 10000);

  storage.failing = [];
  store.trackFree(paradiddle, playing, 20000);
  assert.equal(store.finishFree("single-paradiddle", 25000), true);
  assert.equal(store.freeHistory().length, 1);
  assert.equal(store.freeHistory()[0]?.activeDurationMs, 15000);
  assert.equal(store.unfinished().length, 0);
});

test("changing the note value during free practice splits the time into two stretches", () => {
  const store = createSessionStore(memory());
  store.trackFree(paradiddle, playing, 0);
  store.rescaleFree("single-paradiddle", fraction(2), 10000);
  store.finishFree("single-paradiddle", 30000);
  assert.deepEqual(
    store
      .freeHistory()[0]
      ?.exercises[0]?.rounds[0]?.segments.map(
        (segment) => segment.activeDurationMs,
      ),
    [10000, 20000],
  );
});
