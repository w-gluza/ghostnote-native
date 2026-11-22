import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { SymbolView } from "expo-symbols";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/AppText/AppText";
import { RowText } from "@/components/RowText/RowText";
import { NumberedRow } from "@/components/NumberedRow/NumberedRow";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { findEntry } from "@/features/library/domain/catalogue";
import { exerciseRoute } from "@/features/practice/domain/exercise-route";
import { useActiveSession } from "@/features/practice/stores/practice-session";
import {
  selectPracticeRoutine,
  usePracticeRoutine,
} from "@/features/practice/stores/practice-choice";
import { useRoutine } from "@/features/routines/stores/saved-routines";
import { quickWarmUp } from "@/features/routines/domain/starter-routines";
import {
  isRoutineComplete,
  nextExercise,
  roundsDone,
} from "@/features/practice/domain/session";
import {
  exerciseMinutes,
  exercisesLabel,
  routineLevel,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import type { RoutineExercise } from "@/features/routines/domain/types";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { nativeHeader } from "@/theme/navigation";
import { divider, layout, layoutStyles, spacing } from "@/theme/layout";

function SetlistRow({
  done,
  exercise,
  position,
  onPress,
}: {
  done: number;
  exercise: RoutineExercise;
  position: number;
  onPress: () => void;
}) {
  const entry = findEntry(exercise.pattern.rudimentId);
  if (!entry) {
    return null;
  }
  const isComplete = done >= exercise.rounds.length;

  return (
    <NumberedRow
      position={position}
      accessibilityLabel={`${entry.name}, ${exerciseMinutes(exercise)} minutes, ${done} of ${exercise.rounds.length} rounds done, ${entry.source === "rudiment" ? "sticking " : ""}${entry.detail}`}
      indicator={isComplete ? "checkmark" : "chevron"}
      trailing={
        <View style={styles.rowStatus}>
          <AppText variant="bodySmall" tone="secondary" tabular>
            {exerciseMinutes(exercise)} min
          </AppText>
          <AppText
            variant="bodySmall"
            tone={done > 0 ? "accent" : "secondary"}
            tabular
          >
            {done}/{exercise.rounds.length} rounds
          </AppText>
        </View>
      }
      onPress={onPress}
    >
      <RowText
        title={entry.name}
        titleTone={isComplete ? "secondary" : "primary"}
        detail={entry.detail}
      />
    </NumberedRow>
  );
}

export default function RoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const routine = useRoutine(params.id) ?? quickWarmUp;
  const isPractice = usePracticeRoutine().id === routine.id;
  const [selectFailed, setSelectFailed] = useState(false);
  const chooseForPractice = () =>
    setSelectFailed(!selectPracticeRoutine(routine.id));
  const totalMinutes = routineMinutes(routine);
  const openExercise = (exercise: RoutineExercise) =>
    router.push(exerciseRoute(exercise, routine.id));
  const session = useActiveSession(routine.id);
  const isComplete = isRoutineComplete(session, routine);
  const isStarted = session !== undefined;
  const next = nextExercise(session, routine);

  return (
    <SafeAreaView edges={["bottom"]} style={layoutStyles.screen}>
      <Stack.Screen
        options={{
          ...nativeHeader,
          headerBackTitle: isPractice ? "Practice" : "Routines",
          headerRight: () => (
            <Button
              variant="text"
              tone="accent"
              onPress={() =>
                router.push({
                  pathname: "/routine-editor",
                  params: { id: routine.id },
                })
              }
            >
              Edit
            </Button>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={layoutStyles.content}
      >
        <PageTitle>{routine.name}</PageTitle>
        <View style={styles.summary}>
          <SymbolView
            name="clock"
            size={16}
            weight="regular"
            tintColor={colors.text.secondary}
          />
          <AppText
            variant="bodySmall"
            tone="secondary"
            accessibilityLabel={`${totalMinutes} minutes, ${exercisesLabel(routine.exercises.length)}, level ${routineLevel(routine)}`}
          >
            {totalMinutes} min · {exercisesLabel(routine.exercises.length)} ·
            Lvl {routineLevel(routine)}
          </AppText>
        </View>

        <SectionHeader
          title="YOUR SETLIST"
          trailing={exercisesLabel(routine.exercises.length)}
          style={styles.sectionHeader}
        />

        {routine.exercises.map((exercise, index) => (
          <SetlistRow
            key={exercise.id}
            done={roundsDone(session, exercise)}
            exercise={exercise}
            position={index + 1}
            onPress={() => openExercise(exercise)}
          />
        ))}
      </ScrollView>

      <Button
        icon={isComplete ? "checkmark.circle" : "play.circle"}
        style={styles.start}
        onPress={() =>
          isComplete
            ? router.push({
                pathname: "/summary",
                params: { routine: routine.id },
              })
            : next && openExercise(next)
        }
      >
        {isComplete
          ? "View Summary"
          : isStarted
            ? "Resume Practice"
            : "Start Practice"}
      </Button>
      {selectFailed ? (
        <InlineMessage style={styles.selectFailed}>
          This routine could not be set for practice. Try again.
        </InlineMessage>
      ) : null}
      {isPractice ? (
        <View accessible style={styles.use}>
          <SymbolView
            name="checkmark"
            size={12}
            weight="medium"
            tintColor={colors.text.secondary}
          />
          <AppText variant="label" tone="secondary">
            Used for Practice
          </AppText>
        </View>
      ) : (
        <Button
          variant="text"
          style={styles.choose}
          onPress={chooseForPractice}
        >
          Use for Practice
        </Button>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginTop: spacing.sm,
    paddingBottom: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...divider.bottom,
  },
  sectionHeader: {
    marginTop: spacing.section,
  },
  rowStatus: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  choose: {
    alignSelf: "center",
  },
  use: {
    minHeight: layout.minTouchSize,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: spacing.sm,
  },
  selectFailed: {
    marginHorizontal: layout.screenInset,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  start: {
    marginHorizontal: layout.screenInset,
    marginBottom: spacing.xs,
  },
});
