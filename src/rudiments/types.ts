import type { Fraction } from "./fraction";

export type { Fraction };

export type Hand = "R" | "L";

export type StrokeDynamics = "normal" | "ghost" | "accent";

export type OnsetStroke = {
  id: string;
  kind: "onset";
  hand: Hand;
  at: Fraction;
  dynamics?: StrokeDynamics;
  technique?: "multiple-bounce";
};

export type GraceStroke = {
  id: string;
  kind: "grace";
  hand: Hand;
  beforeStrokeId: string;
  order: number;
};

export type Stroke = OnsetStroke | GraceStroke;

export type StrokeGroup = {
  id: string;
  kind: "phrase" | "diddle";
  strokeIds: string[];
  label?: string;
};

export type RudimentPattern = {
  id: string;
  label: string;
  version: number;
  cycleDuration: Fraction;
  strokes: Stroke[];
  groups?: StrokeGroup[];
};

export type Tempo = {
  bpm: number;
  pulseQuarterUnits: Fraction;
};

export type RudimentCategory = "Rolls" | "Diddles" | "Flams" | "Drags";

export type Rudiment = {
  id: string;
  pasNumber?: number;
  name: string;
  category: RudimentCategory;
  level: number;
  defaultTempo?: Tempo;
  defaultPattern: { patternId: string; patternVersion: number };
  patterns: RudimentPattern[];
};

export type PatternReference = {
  rudimentId: string;
  patternId: string;
  patternVersion: number;
};

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

export type PracticeSegment = {
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
