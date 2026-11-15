import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/AppText/AppText";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import {
  finishSession,
  useActiveSession,
} from "@/features/practice/stores/practice-session";
import { useRoutine } from "@/features/routines/stores/saved-routines";
import {
  completedRoundCount,
  playedTempoLabel,
  sessionActiveMs,
  sessionRoundCount,
} from "@/features/practice/domain/session";
import { playedStat } from "@/features/practice/domain/insights";
import { quickWarmUp } from "@/features/routines/domain/starter-routines";
import type { CompletedExercise } from "@/features/practice/domain/types";
import { Button } from "@/components/Button/Button";
import { colors } from "@/theme/colors";
import { layout, layoutStyles } from "@/theme/layout";
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
        <AppText variant="headline">{played.rudimentName}</AppText>
        <AppText variant="caption" tone="secondary">
          {detail}
        </AppText>
      </View>
      <AppText variant="bodySmall" tone="secondary" tabular>
        {rounds}
      </AppText>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View accessible style={styles.stat}>
      <AppText variant="heading" tabular style={styles.statValue}>
        {value}
      </AppText>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

export default function SummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routine?: string }>();
  const routine = useRoutine(params.routine) ?? quickWarmUp;
  const session = useActiveSession(routine.id);
  const played = session?.exercises ?? [];
  const timePlayed = playedStat(sessionActiveMs(session));
  const [saveFailed, setSaveFailed] = useState(false);
  const finish = () => {
    if (!finishSession(routine.id, Date.now())) {
      setSaveFailed(true);
      return;
    }
    router.dismissTo("/");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={layoutStyles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <PageTitle>Practice complete</PageTitle>
          <SymbolView
            name="checkmark.circle"
            size={28}
            weight="light"
            tintColor={colors.accent}
          />
        </View>
        <AppText variant="bodySmall" tone="secondary" style={styles.subtitle}>
          {session?.routineName ?? routine.name}
        </AppText>

        <View style={styles.stats}>
          <Stat value={timePlayed.value} label={timePlayed.label} />
          <View style={styles.statRule} />
          <Stat value={`${played.length}`} label="exercises" />
          <View style={styles.statRule} />
          <Stat value={`${sessionRoundCount(session)}`} label="rounds" />
        </View>

        <SectionHeader title="WHAT YOU PLAYED" style={styles.sectionHeader} />
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
        <InlineMessage style={styles.saveFailed}>
          This session could not be saved. Your practice is still here - try
          again.
        </InlineMessage>
      ) : null}
      <Button style={styles.finish} onPress={finish}>
        Finish
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: layout.screenInset,
    paddingBottom: 24,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  subtitle: {
    marginTop: 8,
  },
  stats: {
    marginTop: 28,
    paddingVertical: 20,
    borderRadius: layout.radius.panel,
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
    fontSize: typography.fontSize.heading,
  },
  statRule: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: colors.border,
  },
  sectionHeader: {
    marginTop: 32,
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
  saveFailed: {
    marginHorizontal: layout.screenInset,
    marginBottom: 12,
    textAlign: "center",
  },
  finish: {
    marginHorizontal: layout.screenInset,
    marginBottom: 8,
  },
});
