import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "../../rudiments/domain/fraction.ts";
import { decode, encode } from "../../../storage/envelope.ts";
import { validItems } from "../../../storage/validators.ts";
import { isActiveSession, isPracticeSession } from "./stored.ts";
import type { PracticeSession } from "./types.ts";

const pattern = {
  rudimentId: "single-paradiddle",
  patternId: "standard",
  patternVersion: 1,
};
const tempo = { bpm: 80, pulseQuarterUnits: ONE };
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

test("sessions survive being written and read back", () => {
  const sessions = validItems(decode(encode([session])), isPracticeSession);
  assert.deepEqual(sessions, [session]);
  assert.ok(isActiveSession(session));
});

test("damaged sessions are dropped and sound ones kept", () => {
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
