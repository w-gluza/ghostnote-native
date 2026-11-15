import type {
  Fraction,
  PatternReference,
  Tempo,
} from "../../rudiments/domain/types";

export type RoutineRound = {
  id: string;
  tempo: Tempo;
  durationSeconds: number;
};

export type RoutineExercise = {
  id: string;
  pattern: PatternReference;
  rhythmicScale: Fraction;
  rounds: RoutineRound[];
};

export type Routine = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
};
