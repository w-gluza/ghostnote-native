import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { findRudiment } from "@/rudiments/library";
import { useRoundsDone } from "@/rudiments/round-log";
import { routineMinutes, todaysRoutine } from "@/rudiments/todays-routine";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const routine = todaysRoutine;

type Exercise = (typeof todaysRoutine.exercises)[number];

function SetlistRow({
  exercise,
  position,
  onPress,
}: {
  exercise: Exercise;
  position: number;
  onPress: () => void;
}) {
  const roundsDone = useRoundsDone(exercise.id);
  const rudiment = findRudiment(exercise.id);
  if (!rudiment) {
    return null;
  }
  const isComplete = roundsDone >= exercise.rounds;
  const sticking = rudiment.pattern.strokes
    .map((stroke) => stroke.hand)
    .join(" ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${rudiment.name}, ${exercise.minutes} minutes, ${roundsDone} of ${exercise.rounds} rounds done, sticking ${sticking}`}
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
        <Text style={styles.minutes}>{exercise.minutes} min</Text>
        <Text style={[styles.minutes, roundsDone > 0 && styles.roundsStarted]}>
          {roundsDone}/{exercise.rounds} rounds
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
  const totalMinutes = routineMinutes(routine);
  const openExercise = (id: string) =>
    router.push({
      pathname: "/rudiment/[id]",
      params: { id, routine: "today" },
    });
  const first = routine.exercises[0];

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Practice",
          headerShadowVisible: false,
          headerTintColor: colors.text.primary,
          headerStyle: { backgroundColor: colors.background },
          headerRight: () => (
            <Pressable accessibilityRole="button" hitSlop={12}>
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
            {routine.level}
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
            exercise={exercise}
            position={index + 1}
            onPress={() => openExercise(exercise.id)}
          />
        ))}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={() => first && openExercise(first.id)}
        style={({ pressed }) => [styles.start, pressed && styles.pressed]}
      >
        <SymbolView
          name="play.circle"
          size={20}
          weight="medium"
          tintColor={colors.text.onAccent}
        />
        <Text style={styles.startLabel}>Start Practice</Text>
      </Pressable>
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
  start: {
    marginHorizontal: 24,
    marginBottom: 8,
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
