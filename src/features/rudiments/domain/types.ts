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
