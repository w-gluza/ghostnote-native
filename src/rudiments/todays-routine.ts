export const todaysRoutine = {
  name: "Today's Routine",
  level: 1,
  exercises: [
    { id: "single-stroke-roll", minutes: 7, rounds: 3, bpm: 80 },
    { id: "double-stroke-roll", minutes: 7, rounds: 3, bpm: 70 },
    { id: "single-paradiddle", minutes: 6, rounds: 3, bpm: 60 },
  ],
};

export function routineMinutes(routine: typeof todaysRoutine) {
  return routine.exercises.reduce(
    (total, exercise) => total + exercise.minutes,
    0,
  );
}
