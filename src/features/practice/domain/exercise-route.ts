import { findEntry } from "../../library/domain/catalogue.ts";
import type { RoutineExercise } from "../../routines/domain/types";

export function exerciseRoute(exercise: RoutineExercise, routineId: string) {
  const id = exercise.pattern.rudimentId;
  const params = { id, routine: routineId, exercise: exercise.id };
  const source = findEntry(id)?.source;
  if (source === "groove") {
    return { pathname: "/groove/[id]", params } as const;
  }
  if (source === "kit-coordination") {
    return { pathname: "/kit-exercise/[id]", params } as const;
  }
  return { pathname: "/rudiment/[id]", params } as const;
}
