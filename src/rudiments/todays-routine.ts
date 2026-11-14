export type Round = {
  bpm: number;
  seconds: number;
};

export type Exercise = {
  id: string;
  rounds: Round[];
};

export type Routine = {
  id: string;
  name: string;
  level: number;
  exercises: Exercise[];
};

export function evenRounds(count: number, bpm: number, minutes: number) {
  const seconds = Math.round((minutes * 60) / count);
  return Array.from({ length: count }, (): Round => ({ bpm, seconds }));
}

export const todaysRoutine: Routine = {
  id: "today",
  name: "Today's Routine",
  level: 1,
  exercises: [
    { id: "single-stroke-roll", rounds: evenRounds(3, 80, 7) },
    { id: "double-stroke-roll", rounds: evenRounds(3, 70, 7) },
    { id: "single-paradiddle", rounds: evenRounds(3, 60, 6) },
  ],
};

function minutesOf(seconds: number) {
  return Math.max(1, Math.round(seconds / 60));
}

function secondsOf(exercise: Exercise) {
  return exercise.rounds.reduce((total, round) => total + round.seconds, 0);
}

export function exerciseMinutes(exercise: Exercise) {
  return minutesOf(secondsOf(exercise));
}

export function routineMinutes(routine: Pick<Routine, "exercises">) {
  if (routine.exercises.length === 0) {
    return 0;
  }
  return minutesOf(
    routine.exercises.reduce(
      (total, exercise) => total + secondsOf(exercise),
      0,
    ),
  );
}

export function tempoLabel(exercise: Exercise) {
  const tempos = exercise.rounds.map((round) => round.bpm);
  const slowest = Math.min(...tempos);
  const fastest = Math.max(...tempos);
  return slowest === fastest ? `${slowest}` : `${slowest}-${fastest}`;
}
