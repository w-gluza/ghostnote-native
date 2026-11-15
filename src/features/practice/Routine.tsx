import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/AppText/AppText";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { findRudiment, stickingOf } from "@/features/rudiments/domain/library";
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
  routineLevel,
  routineMinutes,
} from "@/features/routines/domain/routine-builder";
import type { RoutineExercise } from "@/features/routines/domain/types";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";

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
  const rudiment = findRudiment(exercise.pattern.rudimentId);
  if (!rudiment) {
    return null;
  }
  const isComplete = done >= exercise.rounds.length;
  const sticking = stickingOf(rudiment);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${rudiment.name}, ${exerciseMinutes(exercise)} minutes, ${done} of ${exercise.rounds.length} rounds done, sticking ${sticking}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <AppText variant="body" tone="violet" tabular style={styles.position}>
        {String(position).padStart(2, "0")}
      </AppText>
      <View style={styles.rowText}>
        <AppText variant="headline" tone={isComplete ? "secondary" : "primary"}>
          {rudiment.name}
        </AppText>
        <AppText variant="overline" tone="secondary" style={styles.sticking}>
          {sticking}
        </AppText>
      </View>
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
      <SymbolView
        name={isComplete ? "checkmark" : "chevron.right"}
        size={13}
        weight="medium"
        tintColor={isComplete ? colors.accent : colors.text.secondary}
      />
    </Pressable>
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
    router.push({
      pathname: "/rudiment/[id]",
      params: {
        id: exercise.pattern.rudimentId,
        routine: routine.id,
        exercise: exercise.id,
      },
    });
  const session = useActiveSession(routine.id);
  const isComplete = isRoutineComplete(session, routine);
  const isStarted = session !== undefined;
  const next = nextExercise(session, routine);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: isPractice ? "Practice" : "Routines",
          headerShadowVisible: false,
          headerTintColor: colors.text.primary,
          headerStyle: { backgroundColor: colors.background },
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() =>
                router.push({
                  pathname: "/routine-editor",
                  params: { id: routine.id },
                })
              }
            >
              <AppText variant="bodyStrong" tone="accent">
                Edit
              </AppText>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <PageTitle>{routine.name}</PageTitle>
        <View style={styles.summary}>
          <SymbolView
            name="clock"
            size={16}
            weight="regular"
            tintColor={colors.text.secondary}
          />
          <AppText variant="bodySmall" tone="secondary">
            {totalMinutes} min · {routine.exercises.length} rudiments · Lvl{" "}
            {routineLevel(routine)}
          </AppText>
        </View>

        <SectionHeader
          title="YOUR SETLIST"
          trailing={`${routine.exercises.length} exercises`}
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
        <AppText
          variant="bodySmall"
          accessibilityRole="alert"
          style={styles.selectFailed}
        >
          This routine could not be set for practice. Try again.
        </AppText>
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
            Used for practice
          </AppText>
        </View>
      ) : (
        <Button
          variant="text"
          style={styles.choose}
          onPress={chooseForPractice}
        >
          Use for practice
        </Button>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  summary: {
    marginTop: 8,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    marginTop: 24,
  },
  row: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  position: {
    width: 24,
  },
  rowText: {
    flex: 1,
    gap: 6,
  },
  sticking: {
    letterSpacing: 1,
  },
  rowStatus: {
    alignItems: "flex-end",
    gap: 6,
  },
  choose: {
    alignSelf: "center",
  },
  use: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: 6,
  },
  selectFailed: {
    marginHorizontal: 24,
    marginBottom: 4,
    textAlign: "center",
  },
  start: {
    marginHorizontal: 24,
    marginBottom: 3,
  },
  pressed: {
    opacity: 0.7,
  },
});
