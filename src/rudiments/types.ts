export type Hand = "R" | "L";

export type Stroke = {
  hand: Hand;
  accent?: boolean;
  grace?: Hand[];
  length?: number;
};

export type RudimentPattern = {
  subdivision: number;
  grouping?: number;
  strokes: Stroke[];
};

export type RudimentDefinition = {
  id: string;
  name: string;
  category: string;
  level: number;
  defaultBpm: number;
  pattern: RudimentPattern;
};

export type StrokeSound = {
  now: () => number;
  schedule: (stroke: Stroke, timeMs: number) => void;
  cancel: () => void;
};
