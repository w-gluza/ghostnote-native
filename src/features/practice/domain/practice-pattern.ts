import { defaultPatternReference } from "../../rudiments/domain/library.ts";
import type {
  RoutineExercise,
  RoutineRound,
} from "../../routines/domain/types";
import type { Rudiment } from "../../rudiments/domain/types";

export function freePracticePattern(
  round: RoutineRound | undefined,
  exercise: RoutineExercise | undefined,
  rudiment: Rudiment | undefined,
) {
  if (round) {
    return undefined;
  }
  return (
    exercise?.pattern ??
    (rudiment ? defaultPatternReference(rudiment) : undefined)
  );
}
