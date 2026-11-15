import type {
  Fraction,
  PatternReference,
  Tempo,
} from "../../rudiments/domain/types";

export type PracticeSegment = {
  startedAt?: string;
  tempo: Tempo;
  rhythmicScale: Fraction;
  activeDurationMs: number;
};

export type CompletedRound = {
  id: string;
  sourceRoundId?: string;
  outcome: "completed" | "partial";
  segments: PracticeSegment[];
  activeDurationMs: number;
  completedAt: string;
};

export type CompletedExercise = {
  sourceExerciseId?: string;
  rudimentName: string;
  pattern: PatternReference;
  rounds: CompletedRound[];
};

export type PracticeSession = {
  id: string;
  kind?: "free";
  routineId?: string;
  routineName?: string;
  startedAt: string;
  completedAt: string;
  activeDurationMs: number;
  exercises: CompletedExercise[];
};

export type ActiveSession = Omit<
  PracticeSession,
  "completedAt" | "activeDurationMs"
>;
