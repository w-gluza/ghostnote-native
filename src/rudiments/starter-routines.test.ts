import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isRecommended,
  quickWarmUp,
  starterRoutines,
} from "./starter-routines.ts";
import type { Routine } from "./types.ts";

const stored = (routine: Routine): Routine =>
  JSON.parse(JSON.stringify(routine));

test("an untouched starter is recommended, also after being stored", () => {
  for (const routine of starterRoutines) {
    assert.equal(isRecommended(routine), true);
    assert.equal(isRecommended(stored(routine)), true);
  }
});

test("a starter whose exercises were changed is no longer recommended", () => {
  const [first, second] = quickWarmUp.exercises;
  assert.equal(isRecommended({ ...quickWarmUp, exercises: [first!] }), false);
  assert.equal(
    isRecommended({ ...quickWarmUp, exercises: [second!, first!] }),
    false,
  );
  const faster = {
    ...first!,
    rounds: first!.rounds.map((round) => ({
      ...round,
      tempo: { ...round.tempo, bpm: round.tempo.bpm + 10 },
    })),
  };
  assert.equal(
    isRecommended({ ...quickWarmUp, exercises: [faster, second!] }),
    false,
  );
});

test("renaming a starter keeps it recommended", () => {
  assert.equal(isRecommended({ ...quickWarmUp, name: "Warm-up" }), true);
});

test("a drummer's own routine is never recommended", () => {
  assert.equal(isRecommended({ ...quickWarmUp, id: "routine-1" }), false);
});
