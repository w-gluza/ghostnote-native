import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import {
  RudimentRow,
  type Rudiment,
} from "@/features/practice/components/RudimentRow/RudimentRow";
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader";
import { WeekProgress } from "@/features/practice/components/WeekProgress/WeekProgress";
import {
  periodStart,
  sessionsSince,
} from "@/features/practice/domain/insights";
import { findRudiment } from "@/features/rudiments/domain/library";
import { usePracticeRoutine } from "@/features/practice/stores/practice-choice";
import {
  useActiveSession,
  usePracticeHistory,
} from "@/features/practice/stores/practice-session";
import { useWeeklyGoal } from "@/features/practice/stores/weekly-goal";
import {
  exerciseMinutes,
  routineLevel,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import { rudimentVideos } from "@/features/rudiments/domain/videos";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { layoutStyles } from "@/theme/layout";

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
  const hasUnfinishedPractice = useActiveSession(routine.id) !== undefined;
  const rudiments: Rudiment[] = routine.exercises.map((exercise) => ({
    name: findRudiment(exercise.pattern.rudimentId)?.name ?? "",
    minutes: exerciseMinutes(exercise),
    rounds: exercise.rounds.length,
    bpm: exercise.rounds[0]?.tempo.bpm ?? 0,
    video: rudimentVideos[exercise.pattern.rudimentId],
  }));
  const open = () =>
    router.push({ pathname: "/routine", params: { id: routine.id } });
  const sessionsThisWeek = sessionsSince(history, periodStart("week", now));

  return (
    <ScrollView
      style={layoutStyles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={layoutStyles.contentBelowHeader}
    >
      <ScreenHeader />

      <PageTitle size="large" style={styles.title}>
        {"Your\nPractice"}
      </PageTitle>

      <View style={styles.summary}>
        <AppText variant="bodySmall">
          {routineMinutes(routine)} min • {rudiments.length} rudiments • Lvl{" "}
          {routineLevel(routine)}
        </AppText>
        <WeekProgress done={sessionsThisWeek} goal={weeklyGoal} />
      </View>

      <View style={styles.card}>
        {rudiments.map((rudiment, index) => (
          <RudimentRow
            key={rudiment.name}
            rudiment={rudiment}
            position={index + 1}
            isLast={index === rudiments.length - 1}
            onPress={open}
          />
        ))}
      </View>

      <Button style={styles.start} onPress={open}>
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
    marginTop: 30,
  },
  summary: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    marginTop: 32,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 20,
    borderRadius: 28,
    backgroundColor: colors.surface,
  },
  start: {
    marginTop: 24,
    alignSelf: "center",
  },
  saved: {
    marginTop: 3,
    alignSelf: "center",
  },
});
