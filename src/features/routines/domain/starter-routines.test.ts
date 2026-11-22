import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isRecommended,
  quickWarmUp,
  starterRoutines,
} from "./starter-routines.ts";
import {
  isRoutineComplete,
  roundsDone,
} from "../../practice/domain/session.ts";
import type { ActiveSession } from "../../practice/domain/types.ts";
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
  const [first, second, third] = quickWarmUp.exercises;
  assert.equal(
    isRecommended({ ...quickWarmUp, exercises: [first!, second!] }),
    false,
  );
  assert.equal(
    isRecommended({ ...quickWarmUp, exercises: [second!, first!, third!] }),
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
    isRecommended({ ...quickWarmUp, exercises: [faster, second!, third!] }),
    false,
  );
});

test("renaming a starter keeps it recommended", () => {
  assert.equal(isRecommended({ ...quickWarmUp, name: "Warm-up" }), true);
});

test("a drummer's own routine is never recommended", () => {
  assert.equal(isRecommended({ ...quickWarmUp, id: "routine-1" }), false);
});

test("rudiment rounds from the earlier Quick Warm-up do not count towards the kit exercises that replaced them", () => {
  const earlier = {
    rudimentId: "double-stroke-roll",
    patternId: "standard",
    patternVersion: 1,
  };
  const session: ActiveSession = {
    id: "session-1",
    routineId: quickWarmUp.id,
    startedAt: new Date(0).toISOString(),
    exercises: [
      {
        sourceExerciseId: "quick-warm-up-e2",
        rudimentName: "Double Stroke Roll",
        pattern: earlier,
        rounds: [
          {
            id: "round-1",
            sourceRoundId: "quick-warm-up-e2-r1",
            outcome: "completed",
            segments: [],
            activeDurationMs: 90000,
            completedAt: new Date(90000).toISOString(),
          },
        ],
      },
    ],
  };

  const ids = quickWarmUp.exercises.map((exercise) => exercise.id);
  assert.equal(ids.includes("quick-warm-up-e2"), false);
  assert.equal(ids.includes("quick-warm-up-e3"), false);
  for (const exercise of quickWarmUp.exercises) {
    assert.equal(roundsDone(session, exercise), 0, exercise.id);
  }
  assert.equal(isRoutineComplete(session, quickWarmUp), false);
  assert.equal(session.exercises[0]?.rudimentName, "Double Stroke Roll");
});
