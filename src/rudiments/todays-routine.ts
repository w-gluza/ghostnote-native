export type Exercise = {
  id: string;
  minutes: number;
  rounds: number;
  bpm: number;
};

export type Routine = {
  id: string;
  name: string;
  level: number;
  exercises: Exercise[];
};

export const todaysRoutine: Routine = {
  id: "today",
  name: "Today's Routine",
  level: 1,
  exercises: [
    { id: "single-stroke-roll", minutes: 7, rounds: 3, bpm: 80 },
    { id: "double-stroke-roll", minutes: 7, rounds: 3, bpm: 70 },
    { id: "single-paradiddle", minutes: 6, rounds: 3, bpm: 60 },
  ],
};

export function routineMinutes(routine: Routine) {
  return routine.exercises.reduce(
    (total, exercise) => total + exercise.minutes,
    0,
  );
}
