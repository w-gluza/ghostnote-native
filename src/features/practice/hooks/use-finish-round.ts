import { NotificationFeedbackType, notificationAsync } from "expo-haptics";
import { useRouter } from "expo-router";

import { exerciseRoute } from "@/features/practice/domain/exercise-route";
import { nextExercise } from "@/features/practice/domain/session";
import type { RoundOutcome } from "@/features/practice/hooks/use-round-practice";
import { activeSession } from "@/features/practice/stores/practice-session";
import type { Routine } from "@/features/routines/domain/types";

export function useFinishRound(
  routine: Routine | undefined,
  completeRound: () => RoundOutcome | undefined,
) {
  const router = useRouter();

  return () => {
    const outcome = completeRound();
    if (outcome) {
      notificationAsync(NotificationFeedbackType.Success).catch(() => {});
    }
    if (!routine) {
      return;
    }
    if (outcome === "routine-complete") {
      router.replace({ pathname: "/summary", params: { routine: routine.id } });
    } else if (outcome === "exercise-complete") {
      const next = nextExercise(activeSession(routine.id), routine);
      if (next) {
        router.replace(exerciseRoute(next, routine.id));
      } else {
        router.back();
      }
    }
  };
}
