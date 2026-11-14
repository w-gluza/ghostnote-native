import { todaysRoutine, type Routine } from "./todays-routine";

export const savedRoutines: Routine[] = [
  {
    id: "quick-warm-up",
    name: "Quick Warm-up",
    level: 1,
    exercises: [
      { id: "single-stroke-roll", minutes: 3, rounds: 2, bpm: 70 },
      { id: "double-stroke-roll", minutes: 3, rounds: 2, bpm: 60 },
    ],
  },
  {
    id: "paradiddle-focus",
    name: "Paradiddle Focus",
    level: 1,
    exercises: [
      { id: "single-stroke-roll", minutes: 4, rounds: 2, bpm: 80 },
      { id: "single-paradiddle", minutes: 10, rounds: 4, bpm: 70 },
    ],
  },
  {
    id: "roll-builder",
    name: "Roll Builder",
    level: 2,
    exercises: [
      { id: "single-stroke-roll", minutes: 8, rounds: 4, bpm: 100 },
      { id: "double-stroke-roll", minutes: 8, rounds: 4, bpm: 90 },
      { id: "single-paradiddle", minutes: 4, rounds: 2, bpm: 80 },
    ],
  },
];

export function findRoutine(id: string | undefined) {
  if (!id || id === todaysRoutine.id) {
    return todaysRoutine;
  }
  return savedRoutines.find((routine) => routine.id === id);
}
