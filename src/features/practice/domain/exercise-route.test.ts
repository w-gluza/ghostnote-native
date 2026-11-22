import assert from "node:assert/strict";
import { test } from "node:test";

import { quickWarmUp } from "../../routines/domain/starter-routines.ts";
import { exerciseRoute } from "./exercise-route.ts";

test("each routine exercise opens in the player that can play it", () => {
  assert.deepEqual(
    quickWarmUp.exercises.map((exercise) =>
      exerciseRoute(exercise, quickWarmUp.id),
    ),
    [
      {
        pathname: "/rudiment/[id]",
        params: {
          id: "single-stroke-roll",
          routine: "quick-warm-up",
          exercise: "quick-warm-up-e1",
        },
      },
      {
        pathname: "/kit-exercise/[id]",
        params: {
          id: "snare-over-feet",
          routine: "quick-warm-up",
          exercise: "quick-warm-up-e2",
        },
      },
      {
        pathname: "/groove/[id]",
        params: {
          id: "groove-basic-rock",
          routine: "quick-warm-up",
          exercise: "quick-warm-up-e3",
        },
      },
    ],
  );
});
