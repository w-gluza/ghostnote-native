import type {
  ActiveSession,
  CompletedExercise,
  CompletedRound,
  PracticeSession,
  Routine,
  RoutineExercise,
  RoutineRound,
} from "../../rudiments/domain/types";

export function startSession(
  routine: Pick<Routine, "id" | "name">,
  id: string,
  startedAt: string,
): ActiveSession {
  return {
    id,
    routineId: routine.id,
    routineName: routine.name,
    startedAt,
    exercises: [],
  };
}

export function recordRound(
  session: ActiveSession,
  exercise: Pick<RoutineExercise, "id" | "pattern">,
  rudimentName: string,
  round: CompletedRound,
): ActiveSession {
  const exists = session.exercises.some(
    (completed) => completed.sourceExerciseId === exercise.id,
  );
  const exercises = exists
    ? session.exercises.map((completed) =>
        completed.sourceExerciseId === exercise.id
          ? { ...completed, rounds: [...completed.rounds, round] }
          : completed,
      )
    : [
        ...session.exercises,
        {
          sourceExerciseId: exercise.id,
          rudimentName,
          pattern: exercise.pattern,
          rounds: [round],
        },
      ];
  return { ...session, exercises };
}

function withoutLastCompleted(rounds: CompletedRound[]) {
  const last = rounds.findLastIndex((round) => round.outcome === "completed");
  return last < 0 ? rounds : rounds.filter((_, index) => index !== last);
}

export function removeLastRound(
  session: ActiveSession,
  exerciseId: string,
): ActiveSession {
  return {
    ...session,
    exercises: session.exercises
      .map((completed) =>
        completed.sourceExerciseId === exerciseId
          ? { ...completed, rounds: withoutLastCompleted(completed.rounds) }
          : completed,
      )
      .filter((completed) => completed.rounds.length > 0),
  };
}

function completedRoundIds(
  session: ActiveSession | undefined,
  exerciseId: string,
) {
  const completed = session?.exercises.find(
    (exercise) => exercise.sourceExerciseId === exerciseId,
  );
  return new Set(
    completed?.rounds
      .filter((round) => round.outcome === "completed")
      .map((round) => round.sourceRoundId),
  );
}

export function roundsDone(
  session: ActiveSession | undefined,
  exercise: RoutineExercise,
) {
  const done = completedRoundIds(session, exercise.id);
  return exercise.rounds.filter((round) => done.has(round.id)).length;
}

export function nextRound(
  session: ActiveSession | undefined,
  exercise: RoutineExercise,
): RoutineRound | undefined {
  const done = completedRoundIds(session, exercise.id);
  return exercise.rounds.find((round) => !done.has(round.id));
}

export function nextExercise(
  session: ActiveSession | undefined,
  routine: Routine,
): RoutineExercise | undefined {
  return (
    routine.exercises.find(
      (exercise) => nextRound(session, exercise) !== undefined,
    ) ?? routine.exercises[0]
  );
}

export function isRoutineComplete(
  session: ActiveSession | undefined,
  routine: Routine,
) {
  return (
    routine.exercises.length > 0 &&
    routine.exercises.every(
      (exercise) => nextRound(session, exercise) === undefined,
    )
  );
}

export function sessionActiveMs(session: ActiveSession | undefined) {
  return (session?.exercises ?? []).reduce(
    (sum, exercise) =>
      sum +
      exercise.rounds.reduce(
        (roundSum, round) => roundSum + round.activeDurationMs,
        0,
      ),
    0,
  );
}

export function sessionRoundCount(session: ActiveSession | undefined) {
  return (session?.exercises ?? []).reduce(
    (sum, exercise) => sum + completedRoundCount(exercise),
    0,
  );
}

export function completedRoundCount(exercise: CompletedExercise) {
  return exercise.rounds.filter((round) => round.outcome === "completed")
    .length;
}

export function closeSession(
  session: ActiveSession,
  completedAt: string,
): PracticeSession {
  return {
    ...session,
    completedAt,
    activeDurationMs: sessionActiveMs(session),
  };
}

export function isTargetReached(playedMs: number, targetMs: number) {
  return targetMs > 0 && playedMs >= targetMs;
}

export function clockLabel(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function spokenClock(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const parts = [
    minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : "",
    rest > 0 || minutes === 0
      ? `${rest} ${rest === 1 ? "second" : "seconds"}`
      : "",
  ];
  return parts.filter(Boolean).join(" ");
}

export function playedTempoLabel(exercise: CompletedExercise) {
  const tempos = exercise.rounds.flatMap((round) =>
    round.segments.map((segment) => segment.tempo.bpm),
  );
  if (tempos.length === 0) {
    return undefined;
  }
  const slowest = Math.min(...tempos);
  const fastest = Math.max(...tempos);
  return slowest === fastest ? `${slowest}` : `${slowest}-${fastest}`;
}
