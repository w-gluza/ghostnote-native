import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { LinkRow } from "@/components/LinkRow/LinkRow";
import { OptionMenu } from "@/components/OptionMenu/OptionMenu";
import { StatRow } from "@/components/StatRow/StatRow";
import { links } from "@/links";
import {
  minutesLabel,
  playedTime,
  sessionsLabel,
  WEEKLY_GOAL_CHOICES,
  weekDayMs,
} from "@/rudiments/insights";
import {
  useActiveSessions,
  useFreePractice,
  usePracticeHistory,
  useUnfinishedPractice,
} from "@/rudiments/practice-session";
import { setWeeklyGoal, useWeeklyGoal } from "@/rudiments/weekly-goal";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const GOAL_OPTIONS = WEEKLY_GOAL_CHOICES.map((count) => ({
  key: count,
  label: sessionsLabel(count),
}));

export default function ProfileScreen() {
  const router = useRouter();
  const weeklyGoal = useWeeklyGoal();
  const [goalSaveFailed, setGoalSaveFailed] = useState(false);
  const history = usePracticeHistory();
  const free = useFreePractice();
  const active = useActiveSessions();
  const unfinished = useUnfinishedPractice();
  const playedThisWeek = weekDayMs(
    playedTime([...history, ...free, ...Object.values(active)], unfinished),
    new Date(),
  ).reduce((total, ms) => total + ms, 0);

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.bar}>
        <Text accessibilityRole="header" style={styles.title}>
          Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.done}>Done</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          YOUR PRACTICE
        </Text>
        <View style={styles.goalRow}>
          <SymbolView
            name="calendar"
            size={24}
            weight="light"
            tintColor={colors.text.secondary}
          />
          <Text style={styles.goalLabel}>Weekly goal</Text>
          <OptionMenu
            name="Weekly goal"
            options={GOAL_OPTIONS}
            selected={weeklyGoal}
            onChange={(goal) => setGoalSaveFailed(!setWeeklyGoal(goal))}
            align="end"
          >
            <Text style={styles.goalValue}>{sessionsLabel(weeklyGoal)}</Text>
            <SymbolView
              name="chevron.down"
              size={12}
              weight="medium"
              tintColor={colors.text.secondary}
            />
          </OptionMenu>
        </View>
        {goalSaveFailed ? (
          <Text accessibilityRole="alert" style={styles.problem}>
            Your weekly goal could not be saved. Choose it again to retry.
          </Text>
        ) : null}
        <StatRow
          symbol="clock"
          label="Played this week"
          value={`${minutesLabel(playedThisWeek)} min`}
          isLast
        />
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          ABOUT
        </Text>
        <LinkRow
          symbol="person"
          label="Made by Wiola Gluza"
          detail="London-based engineer, up for interesting work."
          url={links.author}
        />
        <LinkRow
          symbol="questionmark.circle"
          label="Support"
          url={links.support}
        />
        <LinkRow symbol="lock" label="Privacy policy" url={links.privacy} />
        <StatRow
          symbol="info.circle"
          label="Version"
          value={Constants.expoConfig?.version ?? ""}
          isLast
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.heading,
    lineHeight: 34,
    paddingTop: 6,
  },
  done: {
    color: colors.accent,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    marginBottom: 4,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  goalLabel: {
    flex: 1,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  goalValue: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
    fontVariant: ["tabular-nums"],
  },
  problem: {
    paddingVertical: 12,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  pressed: {
    opacity: 0.7,
  },
});
