import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  finishSession,
  useActiveSession,
} from "@/features/practice/hooks/practice-session";
import { useRoutine } from "@/features/practice/hooks/saved-routines";
import {
  completedRoundCount,
  playedTempoLabel,
  sessionActiveMs,
  sessionRoundCount,
} from "@/features/practice/domain/session";
import { quickWarmUp } from "@/features/practice/domain/starter-routines";
import type { CompletedExercise } from "@/features/rudiments/domain/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

function SummaryRow({
  played,
  plannedRounds,
}: {
  played: CompletedExercise;
  plannedRounds?: number;
}) {
  const tempo = playedTempoLabel(played);
  const detail = tempo ? `${tempo} BPM` : "Not played";
  const completed = completedRoundCount(played);
  const rounds = plannedRounds
    ? `${completed}/${plannedRounds} rounds`
    : `${completed} rounds`;

  return (
    <View
      accessible
      accessibilityLabel={`${played.rudimentName}, ${rounds}, ${tempo ? `${tempo} beats per minute` : "not played"}`}
      style={styles.row}
    >
      <SymbolView
        name="checkmark"
        size={13}
        weight="medium"
        tintColor={colors.accent}
      />
      <View style={styles.rowText}>
        <Text style={styles.name}>{played.rudimentName}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <Text style={styles.rounds}>{rounds}</Text>
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
  const routine = useRoutine(params.routine) ?? quickWarmUp;
  const session = useActiveSession(routine.id);
  const played = session?.exercises ?? [];
  const activeSeconds = sessionActiveMs(session) / 1000;
  const showsSeconds = activeSeconds < 60;
  const [saveFailed, setSaveFailed] = useState(false);
  const finish = () => {
    if (!finishSession(routine.id, Date.now())) {
      setSaveFailed(true);
      return;
    }
    router.dismissTo("/");
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
        <Text style={styles.subtitle}>
          {session?.routineName ?? routine.name}
        </Text>

        <View style={styles.stats}>
          <Stat
            value={`${Math.round(showsSeconds ? activeSeconds : activeSeconds / 60)}`}
            label={showsSeconds ? "seconds played" : "minutes played"}
          />
          <View style={styles.statRule} />
          <Stat value={`${played.length}`} label="exercises" />
          <View style={styles.statRule} />
          <Stat value={`${sessionRoundCount(session)}`} label="rounds" />
        </View>

        <Text accessibilityRole="header" style={styles.sectionTitle}>
          WHAT YOU PLAYED
        </Text>
        {played.map((exercise, index) => (
          <SummaryRow
            key={exercise.sourceExerciseId ?? index}
            played={exercise}
            plannedRounds={
              routine.exercises.find(
                (planned) => planned.id === exercise.sourceExerciseId,
              )?.rounds.length
            }
          />
        ))}
      </ScrollView>

      {saveFailed ? (
        <Text accessibilityRole="alert" style={styles.saveFailed}>
          This session could not be saved. Your practice is still here - try
          again.
        </Text>
      ) : null}
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
  saveFailed: {
    marginHorizontal: 24,
    marginBottom: 12,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    textAlign: "center",
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
