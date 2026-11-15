import assert from "node:assert/strict";
import { test } from "node:test";

import { fraction, ONE } from "../../rudiments/domain/fraction.ts";
import { findRudiment } from "../../rudiments/domain/library.ts";
import type { RoutineExercise } from "../../rudiments/domain/types.ts";
import { freePracticePattern } from "./practice-pattern.ts";

const pattern = {
  rudimentId: "double-stroke-roll",
  patternId: "standard",
  patternVersion: 1,
};
const round = {
  id: "r1",
  tempo: { bpm: 60, pulseQuarterUnits: ONE },
  durationSeconds: 120,
};
const exercise: RoutineExercise = {
  id: "e1",
  pattern,
  rhythmicScale: fraction(8),
  rounds: [round],
};

test("playing a waiting routine round is not free practice", () => {
  const rudiment = findRudiment("double-stroke-roll");
  assert.equal(freePracticePattern(round, exercise, rudiment), undefined);
});

test("playing on after an exercise's rounds are done is free practice of its pattern", () => {
  const rudiment = findRudiment("double-stroke-roll");
  assert.deepEqual(freePracticePattern(undefined, exercise, rudiment), pattern);
});

test("playing a rudiment outside a routine is free practice of its default pattern", () => {
  const rudiment = findRudiment("single-paradiddle");
  assert.ok(rudiment);
  assert.equal(
    freePracticePattern(undefined, undefined, rudiment)?.rudimentId,
    "single-paradiddle",
  );
});

test("an unknown rudiment has nothing to track", () => {
  assert.equal(freePracticePattern(undefined, undefined, undefined), undefined);
});
