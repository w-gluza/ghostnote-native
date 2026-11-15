import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { findRudiment, stickingOf } from "@/features/rudiments/domain/library";
import { useActiveSession } from "@/features/practice/hooks/practice-session";
import {
  selectPracticeRoutine,
  usePracticeRoutine,
} from "@/features/practice/hooks/practice-choice";
import { useRoutine } from "@/features/routines/hooks/saved-routines";
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
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

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
      <Text style={styles.position}>{String(position).padStart(2, "0")}</Text>
      <View style={styles.rowText}>
        <Text style={[styles.name, isComplete && styles.nameDone]}>
          {rudiment.name}
        </Text>
        <Text style={styles.sticking}>{sticking}</Text>
      </View>
      <View style={styles.rowStatus}>
        <Text style={styles.minutes}>{exerciseMinutes(exercise)} min</Text>
        <Text style={[styles.minutes, done > 0 && styles.roundsStarted]}>
          {done}/{exercise.rounds.length} rounds
        </Text>
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
              <Text style={styles.edit}>Edit</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Text accessibilityRole="header" style={styles.title}>
          {routine.name}
        </Text>
        <View style={styles.summary}>
          <SymbolView
            name="clock"
            size={16}
            weight="regular"
            tintColor={colors.text.secondary}
          />
          <Text style={styles.summaryText}>
            {totalMinutes} min · {routine.exercises.length} rudiments · Lvl{" "}
            {routineLevel(routine)}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            YOUR SETLIST
          </Text>
          <Text style={styles.sectionCount}>
            {routine.exercises.length} exercises
          </Text>
        </View>

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

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          isComplete
            ? router.push({
                pathname: "/summary",
                params: { routine: routine.id },
              })
            : next && openExercise(next)
        }
        style={({ pressed }) => [styles.start, pressed && styles.pressed]}
      >
        <SymbolView
          name={isComplete ? "checkmark.circle" : "play.circle"}
          size={20}
          weight="medium"
          tintColor={colors.text.onAccent}
        />
        <Text style={styles.startLabel}>
          {isComplete
            ? "View Summary"
            : isStarted
              ? "Resume Practice"
              : "Start Practice"}
        </Text>
      </Pressable>
      {selectFailed ? (
        <Text accessibilityRole="alert" style={styles.selectFailed}>
          This routine could not be set for practice. Try again.
        </Text>
      ) : null}
      {isPractice ? (
        <View accessible style={styles.use}>
          <SymbolView
            name="checkmark"
            size={12}
            weight="medium"
            tintColor={colors.text.secondary}
          />
          <Text style={styles.usedLabel}>Used for practice</Text>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={chooseForPractice}
          style={({ pressed }) => [styles.use, pressed && styles.pressed]}
        >
          <Text style={styles.useLabel}>Use for practice</Text>
        </Pressable>
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
  edit: {
    color: colors.accent,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.heading,
    lineHeight: 34,
    paddingTop: 6,
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
  summaryText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  sectionCount: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
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
    color: colors.violet,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
    fontVariant: ["tabular-nums"],
  },
  rowText: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  sticking: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 1,
  },
  nameDone: {
    color: colors.text.secondary,
  },
  rowStatus: {
    alignItems: "flex-end",
    gap: 6,
  },
  roundsStarted: {
    color: colors.accent,
  },
  minutes: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    fontVariant: ["tabular-nums"],
  },
  use: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: 6,
  },
  useLabel: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.label,
  },
  usedLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.label,
  },
  selectFailed: {
    marginHorizontal: 24,
    marginBottom: 4,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    textAlign: "center",
  },
  start: {
    marginHorizontal: 24,
    marginBottom: 3,
    minHeight: 56,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.accent,
  },
  startLabel: {
    color: colors.text.onAccent,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  pressed: {
    opacity: 0.7,
  },
});
