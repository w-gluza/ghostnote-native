import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { findRudiment } from "@/rudiments/library";
import { clearRounds, useRoundsDone } from "@/rudiments/round-log";
import { useRoutine } from "@/rudiments/saved-routines";
import {
  routineMinutes,
  tempoLabel,
  todaysRoutine,
  type Exercise,
} from "@/rudiments/todays-routine";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

function SummaryRow({
  routineId,
  exercise,
}: {
  routineId: string;
  exercise: Exercise;
}) {
  const roundsDone = useRoundsDone(routineId, exercise.id);
  const rudiment = findRudiment(exercise.id);
  if (!rudiment) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityLabel={`${rudiment.name}, ${roundsDone} of ${exercise.rounds.length} rounds at ${tempoLabel(exercise)} beats per minute`}
      style={styles.row}
    >
      <SymbolView
        name="checkmark"
        size={13}
        weight="medium"
        tintColor={colors.accent}
      />
      <View style={styles.rowText}>
        <Text style={styles.name}>{rudiment.name}</Text>
        <Text style={styles.detail}>{tempoLabel(exercise)} BPM</Text>
      </View>
      <Text style={styles.rounds}>
        {roundsDone}/{exercise.rounds.length} rounds
      </Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View accessible style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routine?: string }>();
  const routine = useRoutine(params.routine) ?? todaysRoutine;
  const totalRounds = routine.exercises.reduce(
    (total, exercise) => total + exercise.rounds.length,
    0,
  );
  const finish = () => {
    router.dismissTo("/");
    clearRounds(routine);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>
            Practice complete
          </Text>
          <SymbolView
            name="checkmark.circle"
            size={28}
            weight="light"
            tintColor={colors.accent}
          />
        </View>
        <Text style={styles.subtitle}>{routine.name}</Text>

        <View style={styles.stats}>
          <Stat value={`${routineMinutes(routine)}`} label="minutes" />
          <View style={styles.statRule} />
          <Stat value={`${routine.exercises.length}`} label="exercises" />
          <View style={styles.statRule} />
          <Stat value={`${totalRounds}`} label="rounds" />
        </View>

        <Text accessibilityRole="header" style={styles.sectionTitle}>
          WHAT YOU PLAYED
        </Text>
        {routine.exercises.map((exercise) => (
          <SummaryRow
            key={exercise.id}
            routineId={routine.id}
            exercise={exercise}
          />
        ))}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={finish}
        style={({ pressed }) => [styles.finish, pressed && styles.pressed]}
      >
        <Text style={styles.finishLabel}>Finish</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.heading,
    lineHeight: 34,
    paddingTop: 6,
  },
  subtitle: {
    marginTop: 8,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  stats: {
    marginTop: 28,
    paddingVertical: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.heading,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
  },
  statRule: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 4,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  row: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
  detail: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
  },
  rounds: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    fontVariant: ["tabular-nums"],
  },
  finish: {
    marginHorizontal: 24,
    marginBottom: 8,
    minHeight: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  finishLabel: {
    color: colors.text.onAccent,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  pressed: {
    opacity: 0.7,
  },
});
