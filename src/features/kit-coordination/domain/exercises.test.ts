import assert from "node:assert/strict";
import { test } from "node:test";

import { plannedKitExercises, voicesLabel } from "./exercises.ts";

test("the first planned exercise uses all four limbs", () => {
  const [first] = plannedKitExercises;
  assert.equal(first?.name, "Four-Way Coordination");
  assert.equal(
    voicesLabel(first?.voices ?? []),
    "Ride · Snare · Kick · Hi-hat pedal",
  );
});

test("every planned exercise has its own id", () => {
  const ids = plannedKitExercises.map((exercise) => exercise.id);
  assert.equal(new Set(ids).size, ids.length);
});
