import { useEffect, useState } from "react";

import { freePracticePattern } from "@/features/practice/domain/practice-pattern";
import {
  isRoutineComplete,
  nextRound,
  roundsDone,
} from "@/features/practice/domain/session";
import {
  activeSession,
  completeRound,
  finishFree,
  pauseRound,
  rescaleFree,
  rescaleRound,
  trackFree,
  trackRound,
  undoRound,
  useActiveSession,
} from "@/features/practice/hooks/practice-session";
import { useRoutine } from "@/features/routines/hooks/saved-routines";
import { ONE } from "@/features/rudiments/domain/fraction";
import {
  defaultBpm,
  defaultPattern,
  resolvePattern,
} from "@/features/rudiments/domain/library";
import { scaleToStep } from "@/features/rudiments/domain/timeline";
import { quarterTempo } from "@/features/rudiments/domain/timing";
import type {
  Fraction,
  Rudiment,
  Tempo,
} from "@/features/rudiments/domain/types";

const FALLBACK_BPM = 80;

type RoundPracticeTarget = {
  rudiment: Rudiment | undefined;
  routineId: string | undefined;
  exerciseId: string | undefined;
};

export type RoundOutcome = "routine-complete" | "exercise-complete" | "ongoing";

export function useRoundPractice({
  rudiment,
  routineId,
  exerciseId,
}: RoundPracticeTarget) {
  const openedRoutine = useRoutine(routineId);
  const routine = routineId ? openedRoutine : undefined;
  const exercise = routine?.exercises.find((item) => item.id === exerciseId);
  const session = useActiveSession(routine?.id ?? "");
  const roundGoal = exercise?.rounds.length ?? 0;
  const done = exercise ? roundsDone(session, exercise) : 0;
  const round = exercise ? nextRound(session, exercise) : undefined;
  const isComplete = exercise ? round === undefined : false;
  const pattern = exercise
    ? resolvePattern(exercise.pattern)
    : rudiment
      ? defaultPattern(rudiment)
      : undefined;
  const [rhythmicScale, setRhythmicScale] = useState(
    () =>
      exercise?.rhythmicScale ?? (pattern ? scaleToStep(pattern, ONE) : ONE),
  );
  const initialTempo =
    round?.tempo ??
    exercise?.rounds[roundGoal - 1]?.tempo ??
    quarterTempo(rudiment ? defaultBpm(rudiment) : FALLBACK_BPM);
  const freePattern = freePracticePattern(round, exercise, rudiment);
  const freeRudimentId = freePattern?.rudimentId;

  const track = (isPlaying: boolean, tempo: Tempo) => {
    if (routine && exercise && round) {
      trackRound(
        routine,
        exercise,
        round,
        { isPlaying, tempo, rhythmicScale },
        Date.now(),
      );
    } else if (freePattern) {
      trackFree(freePattern, { isPlaying, tempo, rhythmicScale }, Date.now());
    }
  };

  const changeScale = (scale: Fraction) => {
    setRhythmicScale(scale);
    if (routine && exercise && round) {
      rescaleRound(routine.id, exercise.id, round.id, scale, Date.now());
    } else if (freeRudimentId) {
      rescaleFree(freeRudimentId, scale, Date.now());
    }
  };

  useEffect(() => {
    if (!freeRudimentId) {
      return;
    }
    return () => {
      finishFree(freeRudimentId, Date.now());
    };
  }, [freeRudimentId]);

  const trackedRoutineId = routine?.id;
  const trackedExerciseId = exercise?.id;
  const trackedRoundId = round?.id;
  useEffect(() => {
    if (!trackedRoutineId || !trackedExerciseId || !trackedRoundId) {
      return;
    }
    return () => {
      pauseRound(
        trackedRoutineId,
        trackedExerciseId,
        trackedRoundId,
        Date.now(),
      );
    };
  }, [trackedRoutineId, trackedExerciseId, trackedRoundId]);

  const finishRound = (): RoundOutcome | undefined => {
    if (!exercise || !routine || !round) {
      return undefined;
    }
    completeRound(routine, exercise, round, Date.now());
    if (isRoutineComplete(activeSession(routine.id), routine)) {
      return "routine-complete";
    }
    return done + 1 >= roundGoal ? "exercise-complete" : "ongoing";
  };

  const undo = () => {
    if (!exercise || !routine) {
      return;
    }
    undoRound(routine.id, exercise.id, Date.now());
  };

  return {
    routine,
    exercise,
    round,
    done,
    roundGoal,
    isComplete,
    pattern,
    rhythmicScale,
    initialTempo,
    track,
    changeScale,
    finishRound,
    undo,
  };
}
