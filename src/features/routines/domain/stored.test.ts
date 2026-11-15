import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "../../rudiments/domain/fraction.ts";
import { decode, encode } from "../../../storage/envelope.ts";
import { validItems } from "../../../storage/validators.ts";
import { isRoutine } from "./stored.ts";
import type { Routine } from "./types.ts";

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
test("routines survive being written and read back", () => {
  assert.deepEqual(validItems(decode(encode([routine])), isRoutine), [routine]);
});

test("an empty saved list stays empty instead of falling back", () => {
  assert.deepEqual(validItems(decode(encode([])), isRoutine), []);
});

test("damaged routines are dropped and sound ones kept", () => {
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
});
