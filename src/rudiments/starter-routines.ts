import { presetExercise } from "./todays-routine.ts";
import type { Routine } from "./types";

export const quickWarmUp: Routine = {
  id: "quick-warm-up",
  name: "Quick Warm-up",
  exercises: [
    presetExercise("quick-warm-up-e1", "single-stroke-roll", 2, 70, 3),
    presetExercise("quick-warm-up-e2", "double-stroke-roll", 2, 60, 3),
  ],
};

export const starterRoutines: Routine[] = [
  quickWarmUp,
  {
    id: "paradiddle-focus",
    name: "Paradiddle Focus",
    exercises: [
      presetExercise("paradiddle-focus-e1", "single-stroke-roll", 2, 80, 4),
      presetExercise("paradiddle-focus-e2", "single-paradiddle", 4, 70, 10),
    ],
  },
  {
    id: "roll-builder",
    name: "Roll Builder",
    exercises: [
      presetExercise("roll-builder-e1", "single-stroke-roll", 4, 100, 8),
      presetExercise("roll-builder-e2", "double-stroke-roll", 4, 90, 8),
      presetExercise("roll-builder-e3", "single-paradiddle", 2, 80, 4),
    ],
  },
];

export function isRecommended(routine: Routine) {
  const starter = starterRoutines.find(
    (candidate) => candidate.id === routine.id,
  );
  return (
    starter !== undefined &&
    JSON.stringify(routine.exercises) === JSON.stringify(starter.exercises)
  );
}
