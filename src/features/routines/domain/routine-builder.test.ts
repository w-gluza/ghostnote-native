import assert from "node:assert/strict";
import { test } from "node:test";

import { isRoutine } from "./stored.ts";
import { newExerciseFor, routineLevel } from "./routine-builder.ts";
import { quickWarmUp } from "./starter-routines.ts";

test("the quick warm-up has one rudiment, one kit exercise and one groove", () => {
  assert.deepEqual(
    quickWarmUp.exercises.map((exercise) => exercise.pattern.rudimentId),
    ["single-stroke-roll", "snare-over-feet", "groove-basic-rock"],
  );
  assert.equal(isRoutine(quickWarmUp), true);
});

test("a kit exercise or groove joins a routine with three rounds at its own tempo", () => {
  const groove = newExerciseFor("groove-shuffle")!;
  assert.equal(groove.pattern.rudimentId, "groove-shuffle");
  assert.deepEqual(
    groove.rounds.map((round) => [round.tempo.bpm, round.durationSeconds]),
    [
      [90, 120],
      [90, 120],
      [90, 120],
    ],
  );
  assert.deepEqual(groove.rhythmicScale, { numerator: 1, denominator: 1 });
  assert.equal(
    newExerciseFor("single-paradiddle")?.pattern.rudimentId,
    "single-paradiddle",
  );
  assert.equal(newExerciseFor("nothing-here"), undefined);
});

test("a routine is as hard as its hardest exercise of any kind", () => {
  const hard = newExerciseFor("groove-half-time-shuffle")!;
  assert.equal(
    routineLevel({ exercises: [...quickWarmUp.exercises, hard] }),
    4,
  );
});
