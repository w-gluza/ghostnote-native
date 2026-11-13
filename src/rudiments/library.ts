import type { RudimentDefinition } from "./types";

export const rudimentLibrary: RudimentDefinition[] = [
  {
    id: "single-stroke-roll",
    name: "Single Stroke Roll",
    category: "Rolls",
    level: 1,
    defaultBpm: 80,
    pattern: {
      subdivision: 1,
      grouping: 4,
      strokes: [
        { hand: "R" },
        { hand: "L" },
        { hand: "R" },
        { hand: "L" },
        { hand: "R" },
        { hand: "L" },
        { hand: "R" },
        { hand: "L" },
      ],
    },
  },
  {
    id: "double-stroke-roll",
    name: "Double Stroke Roll",
    category: "Rolls",
    level: 1,
    defaultBpm: 70,
    pattern: {
      subdivision: 1,
      grouping: 4,
      strokes: [
        { hand: "R" },
        { hand: "R" },
        { hand: "L" },
        { hand: "L" },
        { hand: "R" },
        { hand: "R" },
        { hand: "L" },
        { hand: "L" },
      ],
    },
  },
  {
    id: "single-paradiddle",
    name: "Single Paradiddle",
    category: "Diddles",
    level: 2,
    defaultBpm: 85,
    pattern: {
      subdivision: 1,
      grouping: 4,
      strokes: [
        { hand: "R", accent: true },
        { hand: "L" },
        { hand: "R" },
        { hand: "R" },
        { hand: "L", accent: true },
        { hand: "R" },
        { hand: "L" },
        { hand: "L" },
      ],
    },
  },
];

export function findRudiment(id: string) {
  return rudimentLibrary.find((rudiment) => rudiment.id === id);
}
