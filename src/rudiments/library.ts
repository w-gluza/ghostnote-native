import { ONE } from "./fraction.ts";
import { parsePattern } from "./notation.ts";
import type {
  PatternReference,
  Rudiment,
  RudimentCategory,
  RudimentPattern,
} from "./types";

type RudimentEntry = {
  pasNumber: number;
  id: string;
  name: string;
  category: RudimentCategory;
  level: number;
  bpm: number;
  subdivision: number;
  sticking: string;
};

const FALLBACK_BPM = 80;

const playableIds = new Set([
  "single-stroke-roll",
  "triple-stroke-roll",
  "double-stroke-roll",
  "single-paradiddle",
  "double-paradiddle",
  "triple-paradiddle",
  "single-paradiddle-diddle",
]);

const entries: RudimentEntry[] = [
  {
    pasNumber: 1,
    id: "single-stroke-roll",
    name: "Single Stroke Roll",
    category: "Rolls",
    level: 1,
    bpm: 80,
    subdivision: 8,
    sticking: "R L R L | R L R L",
  },
  {
    pasNumber: 2,
    id: "single-stroke-four",
    name: "Single Stroke Four",
    category: "Rolls",
    level: 2,
    bpm: 80,
    subdivision: 3,
    sticking: "R L R L:3 | L R L R:3",
  },
  {
    pasNumber: 3,
    id: "single-stroke-seven",
    name: "Single Stroke Seven",
    category: "Rolls",
    level: 2,
    bpm: 70,
    subdivision: 6,
    sticking: "R L R L R L R:6 | L R L R L R L:6",
  },
  {
    pasNumber: 4,
    id: "multiple-bounce-roll",
    name: "Multiple Bounce Roll",
    category: "Rolls",
    level: 2,
    bpm: 80,
    subdivision: 2,
    sticking: "zR zL zR zL",
  },
  {
    pasNumber: 5,
    id: "triple-stroke-roll",
    name: "Triple Stroke Roll",
    category: "Rolls",
    level: 2,
    bpm: 80,
    subdivision: 6,
    sticking: "R R R | L L L",
  },
  {
    pasNumber: 6,
    id: "double-stroke-roll",
    name: "Double Stroke Roll",
    category: "Rolls",
    level: 1,
    bpm: 70,
    subdivision: 8,
    sticking: "(R R) (L L) | (R R) (L L)",
  },
  {
    pasNumber: 7,
    id: "five-stroke-roll",
    name: "Five Stroke Roll",
    category: "Rolls",
    level: 2,
    bpm: 70,
    subdivision: 8,
    sticking: "(R R) (L L) >R:4 | (L L) (R R) >L:4",
  },
  {
    pasNumber: 8,
    id: "six-stroke-roll",
    name: "Six Stroke Roll",
    category: "Rolls",
    level: 3,
    bpm: 70,
    subdivision: 8,
    sticking: ">R:2 (L L) (R R) >L:2",
  },
  {
    pasNumber: 9,
    id: "seven-stroke-roll",
    name: "Seven Stroke Roll",
    category: "Rolls",
    level: 2,
    bpm: 70,
    subdivision: 8,
    sticking: "(R R) (L L) (R R) >L:2 | (L L) (R R) (L L) >R:2",
  },
  {
    pasNumber: 10,
    id: "nine-stroke-roll",
    name: "Nine Stroke Roll",
    category: "Rolls",
    level: 2,
    bpm: 70,
    subdivision: 8,
    sticking: "(R R) (L L) (R R) (L L) >R:8 | (L L) (R R) (L L) (R R) >L:8",
  },
  {
    pasNumber: 11,
    id: "ten-stroke-roll",
    name: "Ten Stroke Roll",
    category: "Rolls",
    level: 3,
    bpm: 70,
    subdivision: 8,
    sticking: "(R R) (L L) (R R) (L L) >R:2 >L:6",
  },
  {
    pasNumber: 12,
    id: "eleven-stroke-roll",
    name: "Eleven Stroke Roll",
    category: "Rolls",
    level: 3,
    bpm: 70,
    subdivision: 8,
    sticking:
      "(R R) (L L) (R R) (L L) (R R) >L:6 | (L L) (R R) (L L) (R R) (L L) >R:6",
  },
  {
    pasNumber: 13,
    id: "thirteen-stroke-roll",
    name: "Thirteen Stroke Roll",
    category: "Rolls",
    level: 3,
    bpm: 70,
    subdivision: 8,
    sticking:
      "(R R) (L L) (R R) (L L) (R R) (L L) >R:4 | (L L) (R R) (L L) (R R) (L L) (R R) >L:4",
  },
  {
    pasNumber: 14,
    id: "fifteen-stroke-roll",
    name: "Fifteen Stroke Roll",
    category: "Rolls",
    level: 3,
    bpm: 70,
    subdivision: 8,
    sticking:
      "(R R) (L L) (R R) (L L) (R R) (L L) (R R) >L:2 | (L L) (R R) (L L) (R R) (L L) (R R) (L L) >R:2",
  },
  {
    pasNumber: 15,
    id: "seventeen-stroke-roll",
    name: "Seventeen Stroke Roll",
    category: "Rolls",
    level: 3,
    bpm: 70,
    subdivision: 8,
    sticking:
      "(R R) (L L) (R R) (L L) (R R) (L L) (R R) (L L) >R:8 | (L L) (R R) (L L) (R R) (L L) (R R) (L L) (R R) >L:8",
  },
  {
    pasNumber: 16,
    id: "single-paradiddle",
    name: "Single Paradiddle",
    category: "Diddles",
    level: 2,
    bpm: 85,
    subdivision: 4,
    sticking: ">R L (R R) | >L R (L L)",
  },
  {
    pasNumber: 17,
    id: "double-paradiddle",
    name: "Double Paradiddle",
    category: "Diddles",
    level: 2,
    bpm: 80,
    subdivision: 4,
    sticking: ">R L R L (R R) | >L R L R (L L)",
  },
  {
    pasNumber: 18,
    id: "triple-paradiddle",
    name: "Triple Paradiddle",
    category: "Diddles",
    level: 3,
    bpm: 80,
    subdivision: 4,
    sticking: ">R L R L | R L (R R) | >L R L R | L R (L L)",
  },
  {
    pasNumber: 19,
    id: "single-paradiddle-diddle",
    name: "Single Paradiddle-diddle",
    category: "Diddles",
    level: 3,
    bpm: 80,
    subdivision: 6,
    sticking: ">R L (R R) (L L)",
  },
  {
    pasNumber: 20,
    id: "flam",
    name: "Flam",
    category: "Flams",
    level: 2,
    bpm: 70,
    subdivision: 1,
    sticking: "lR rL",
  },
  {
    pasNumber: 21,
    id: "flam-accent",
    name: "Flam Accent",
    category: "Flams",
    level: 2,
    bpm: 70,
    subdivision: 3,
    sticking: ">lR L R | >rL R L",
  },
  {
    pasNumber: 22,
    id: "flam-tap",
    name: "Flam Tap",
    category: "Flams",
    level: 2,
    bpm: 70,
    subdivision: 2,
    sticking: "(>lR R) | (>rL L)",
  },
  {
    pasNumber: 23,
    id: "flamacue",
    name: "Flamacue",
    category: "Flams",
    level: 3,
    bpm: 70,
    subdivision: 4,
    sticking: "lR >L R L lR:4",
  },
  {
    pasNumber: 24,
    id: "flam-paradiddle",
    name: "Flam Paradiddle",
    category: "Flams",
    level: 3,
    bpm: 70,
    subdivision: 4,
    sticking: ">lR L (R R) | >rL R (L L)",
  },
  {
    pasNumber: 25,
    id: "single-flammed-mill",
    name: "Single Flammed Mill",
    category: "Flams",
    level: 3,
    bpm: 70,
    subdivision: 4,
    sticking: "(>lR R) L R | (>rL L) R L",
  },
  {
    pasNumber: 26,
    id: "flam-paradiddle-diddle",
    name: "Flam Paradiddle-diddle",
    category: "Flams",
    level: 3,
    bpm: 70,
    subdivision: 6,
    sticking: ">lR L (R R) (L L) | >rL R (L L) (R R)",
  },
  {
    pasNumber: 27,
    id: "pataflafla",
    name: "Pataflafla",
    category: "Flams",
    level: 3,
    bpm: 60,
    subdivision: 4,
    sticking: ">lR L R >rL | >lR L R >rL",
  },
  {
    pasNumber: 28,
    id: "swiss-army-triplet",
    name: "Swiss Army Triplet",
    category: "Flams",
    level: 3,
    bpm: 70,
    subdivision: 3,
    sticking: "(>lR R) L | (>lR R) L",
  },
  {
    pasNumber: 29,
    id: "inverted-flam-tap",
    name: "Inverted Flam Tap",
    category: "Flams",
    level: 3,
    bpm: 60,
    subdivision: 2,
    sticking: ">lR L | >rL R",
  },
  {
    pasNumber: 30,
    id: "flam-drag",
    name: "Flam Drag",
    category: "Flams",
    level: 3,
    bpm: 60,
    subdivision: 6,
    sticking: ">lR:2 (L L) R:2 | >rL:2 (R R) L:2",
  },
  {
    pasNumber: 31,
    id: "drag",
    name: "Drag",
    category: "Drags",
    level: 2,
    bpm: 70,
    subdivision: 1,
    sticking: "llR rrL",
  },
  {
    pasNumber: 32,
    id: "single-drag-tap",
    name: "Single Drag Tap",
    category: "Drags",
    level: 2,
    bpm: 70,
    subdivision: 2,
    sticking: "llR >L | rrL >R",
  },
  {
    pasNumber: 33,
    id: "double-drag-tap",
    name: "Double Drag Tap",
    category: "Drags",
    level: 3,
    bpm: 70,
    subdivision: 3,
    sticking: "llR llR >L | rrL rrL >R",
  },
  {
    pasNumber: 34,
    id: "lesson-25",
    name: "Lesson 25",
    category: "Drags",
    level: 3,
    bpm: 70,
    subdivision: 4,
    sticking: "llR L >R:2 | llR L >R:2",
  },
  {
    pasNumber: 35,
    id: "single-dragadiddle",
    name: "Single Dragadiddle",
    category: "Drags",
    level: 3,
    bpm: 60,
    subdivision: 4,
    sticking: "(>R:1/2 R:1/2) L (R R) | (>L:1/2 L:1/2) R (L L)",
  },
  {
    pasNumber: 36,
    id: "drag-paradiddle-1",
    name: "Drag Paradiddle #1",
    category: "Drags",
    level: 3,
    bpm: 60,
    subdivision: 4,
    sticking: ">R:2 llR L (R R) | >L:2 rrL R (L L)",
  },
  {
    pasNumber: 37,
    id: "drag-paradiddle-2",
    name: "Drag Paradiddle #2",
    category: "Drags",
    level: 3,
    bpm: 60,
    subdivision: 4,
    sticking: ">R:2 llR:2 llR L (R R) | >L:2 rrL:2 rrL R (L L)",
  },
  {
    pasNumber: 38,
    id: "single-ratamacue",
    name: "Single Ratamacue",
    category: "Drags",
    level: 3,
    bpm: 60,
    subdivision: 3,
    sticking: "llR L R >L:3 | rrL R L >R:3",
  },
  {
    pasNumber: 39,
    id: "double-ratamacue",
    name: "Double Ratamacue",
    category: "Drags",
    level: 3,
    bpm: 60,
    subdivision: 6,
    sticking: "llR:3 llR:2 L:2 R:2 >L:3 | rrL:3 rrL:2 R:2 L:2 >R:3",
  },
  {
    pasNumber: 40,
    id: "triple-ratamacue",
    name: "Triple Ratamacue",
    category: "Drags",
    level: 3,
    bpm: 60,
    subdivision: 6,
    sticking: "llR:3 llR:3 llR:2 L:2 R:2 >L:6 | rrL:3 rrL:3 rrL:2 R:2 L:2 >R:6",
  },
];

export const rudimentLibrary: Rudiment[] = entries.map((entry) => ({
  id: entry.id,
  pasNumber: entry.pasNumber,
  name: entry.name,
  category: entry.category,
  level: entry.level,
  defaultTempo: { bpm: entry.bpm, pulseQuarterUnits: ONE },
  patterns: [
    parsePattern({
      id: "standard",
      label: "Standard",
      version: 1,
      subdivision: entry.subdivision,
      sticking: entry.sticking,
    }),
  ],
}));

export const availableRudiments = rudimentLibrary.filter((rudiment) =>
  playableIds.has(rudiment.id),
);

export function findRudiment(id: string) {
  return rudimentLibrary.find((rudiment) => rudiment.id === id);
}

export function standardPattern(rudiment: Rudiment): RudimentPattern {
  const pattern = rudiment.patterns[0];
  if (!pattern) {
    throw new Error(`${rudiment.id} has no pattern`);
  }
  return pattern;
}

export function resolvePattern(reference: PatternReference) {
  return findRudiment(reference.rudimentId)?.patterns.find(
    (pattern) =>
      pattern.id === reference.patternId &&
      pattern.version === reference.patternVersion,
  );
}

export function defaultBpm(rudiment: Rudiment) {
  return rudiment.defaultTempo?.bpm ?? FALLBACK_BPM;
}

export function stickingOf(rudiment: Rudiment) {
  const pattern = standardPattern(rudiment);
  return pattern.strokes
    .filter((stroke) => stroke.kind === "onset")
    .map((onset) => {
      const grace = pattern.strokes
        .flatMap((stroke) =>
          stroke.kind === "grace" && stroke.beforeStrokeId === onset.id
            ? [stroke]
            : [],
        )
        .sort((a, b) => a.order - b.order)
        .map((stroke) => stroke.hand.toLowerCase())
        .join("");
      return `${grace}${onset.hand}`;
    })
    .join(" ");
}
