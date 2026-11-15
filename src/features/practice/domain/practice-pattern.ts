import { defaultPatternReference } from "../../rudiments/domain/library.ts";
import type {
  RoutineExercise,
  RoutineRound,
  Rudiment,
} from "../../rudiments/domain/types";

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
