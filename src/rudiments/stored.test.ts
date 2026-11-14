import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "./fraction.ts";
import {
  decode,
  encode,
  isActiveSession,
  isPracticeSession,
  isRoutine,
  SCHEMA_VERSION,
  validItems,
} from "./stored.ts";
import type { PracticeSession, Routine } from "./types.ts";

const pattern = {
  rudimentId: "single-paradiddle",
  patternId: "standard",
  patternVersion: 1,
};
const tempo = { bpm: 80, pulseQuarterUnits: ONE };
const routine: Routine = {
  id: "r1",
  name: "Warm-up",
  exercises: [
    {
      id: "e1",
      pattern,
      rhythmicScale: fraction(4),
      rounds: [{ id: "e1-r1", tempo, durationSeconds: 120 }],
    },
  ],
};
const session: PracticeSession = {
  id: "s1",
  routineId: "r1",
  routineName: "Warm-up",
  startedAt: "2026-11-14T10:00:00.000Z",
  completedAt: "2026-11-14T10:05:00.000Z",
  activeDurationMs: 42000,
  exercises: [
    {
      sourceExerciseId: "e1",
      rudimentName: "Single Paradiddle",
      pattern,
      rounds: [
        {
          id: "p1",
          sourceRoundId: "e1-r1",
          outcome: "completed",
          segments: [
            { tempo, rhythmicScale: fraction(4), activeDurationMs: 42000 },
          ],
          activeDurationMs: 42000,
          completedAt: "2026-11-14T10:05:00.000Z",
        },
      ],
    },
  ],
};

test("routines and sessions survive being written and read back", () => {
  const routines = validItems(decode(encode([routine])), isRoutine);
  assert.deepEqual(routines, [routine]);
  const sessions = validItems(decode(encode([session])), isPracticeSession);
  assert.deepEqual(sessions, [session]);
  assert.ok(isActiveSession(session));
});

test("stored data carries its format version", () => {
  assert.equal(JSON.parse(encode([])).schemaVersion, SCHEMA_VERSION);
});

test("nothing stored, corrupt text or another format version reads as absent", () => {
  assert.equal(decode(null), undefined);
  assert.equal(decode("{not json"), undefined);
  assert.equal(decode("null"), undefined);
  assert.equal(
    decode(JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, data: [] })),
    undefined,
  );
  assert.equal(validItems(undefined, isRoutine), undefined);
  assert.equal(validItems({ routines: [] }, isRoutine), undefined);
});

test("an empty saved list stays empty instead of falling back", () => {
  assert.deepEqual(validItems(decode(encode([])), isRoutine), []);
});

test("damaged items are dropped and sound ones kept", () => {
  const broken = [
    null,
    { ...routine, name: "" },
    { ...routine, exercises: [{ ...routine.exercises[0], rounds: [] }] },
    {
      ...routine,
      exercises: [
        {
          ...routine.exercises[0],
          rhythmicScale: { numerator: 0, denominator: 1 },
        },
      ],
    },
    {
      ...routine,
      exercises: [
        {
          ...routine.exercises[0],
          rounds: [{ id: "x", tempo: { bpm: -1 }, durationSeconds: 60 }],
        },
      ],
    },
  ];
  assert.deepEqual(validItems([...broken, routine], isRoutine), [routine]);

  const brokenSessions = [
    { ...session, startedAt: "yesterday" },
    { ...session, activeDurationMs: -5 },
    {
      ...session,
      exercises: [{ ...session.exercises[0], rudimentName: undefined }],
    },
    {
      ...session,
      exercises: [
        {
          ...session.exercises[0],
          rounds: [{ ...session.exercises[0]!.rounds[0], outcome: "skipped" }],
        },
      ],
    },
  ];
  assert.deepEqual(
    validItems([...brokenSessions, session], isPracticeSession),
    [session],
  );
});
