import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { RudimentRow } from "@/features/practice/components/RudimentRow/RudimentRow";
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader";
import { WeekProgress } from "@/features/practice/components/WeekProgress/WeekProgress";
import {
  periodStart,
  sessionsSince,
} from "@/features/practice/domain/insights";
import {
  isRoutineComplete,
  nextExercise,
} from "@/features/practice/domain/session";
import { findRudiment } from "@/features/rudiments/domain/library";
import { usePracticeRoutine } from "@/features/practice/stores/practice-choice";
import {
  useActiveSession,
  usePracticeHistory,
} from "@/features/practice/stores/practice-session";
import { useWeeklyGoal } from "@/features/practice/stores/weekly-goal";
import {
  exerciseMinutes,
  exercisesLabel,
  routineLevel,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import { rudimentVideos } from "@/features/rudiments/domain/videos";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { layoutStyles, spacing } from "@/theme/layout";

export default function PracticeScreen() {
  const router = useRouter();
  const history = usePracticeHistory();
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, []),
  );
  const weeklyGoal = useWeeklyGoal();
  const routine = usePracticeRoutine();
  const session = useActiveSession(routine.id);
  const hasUnfinishedPractice = session !== undefined;
  const rudiments = routine.exercises.map((exercise) => ({
    id: exercise.id,
    name: findRudiment(exercise.pattern.rudimentId)?.name ?? "",
    minutes: exerciseMinutes(exercise),
    rounds: exercise.rounds.length,
    bpm: exercise.rounds[0]?.tempo.bpm ?? 0,
    video: rudimentVideos[exercise.pattern.rudimentId],
  }));
  const open = () =>
    router.push({ pathname: "/routine", params: { id: routine.id } });
  const start = () => {
    open();
    const next = nextExercise(session, routine);
    if (next && !isRoutineComplete(session, routine)) {
      router.push({
        pathname: "/rudiment/[id]",
        params: {
          id: next.pattern.rudimentId,
          routine: routine.id,
          exercise: next.id,
        },
      });
    }
  };
  const sessionsThisWeek = sessionsSince(history, periodStart("week", now));

  return (
    <ScrollView
      style={layoutStyles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={layoutStyles.contentBelowHeader}
    >
      <ScreenHeader />

      <PageTitle style={styles.title}>Your Practice</PageTitle>

      <View style={styles.summary}>
        <AppText variant="bodySmall">
          {routine.name} · {routineMinutes(routine)} min ·{" "}
          {exercisesLabel(rudiments.length)} · Lvl {routineLevel(routine)}
        </AppText>
        <WeekProgress done={sessionsThisWeek} goal={weeklyGoal} />
      </View>

      <View style={styles.card}>
        {rudiments.map((rudiment, index) => (
          <RudimentRow
            key={rudiment.id}
            rudiment={rudiment}
            position={index + 1}
            isLast={index === rudiments.length - 1}
            onPress={open}
          />
        ))}
      </View>

      <Button style={styles.start} onPress={start}>
        {hasUnfinishedPractice ? "Resume Practice" : "Start Practice"}
      </Button>

      <Button
        variant="text"
        style={styles.saved}
        onPress={() => router.push("/routines")}
      >
        Saved Routines
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
  },
  summary: {
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  card: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    borderRadius: 28,
    backgroundColor: colors.surface,
  },
  start: {
    marginTop: spacing.xl,
    alignSelf: "center",
  },
  saved: {
    marginTop: spacing.xs,
    alignSelf: "center",
  },
});
