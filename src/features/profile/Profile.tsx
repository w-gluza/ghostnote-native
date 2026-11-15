import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { Button } from "@/components/Button/Button";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import { LinkRow } from "@/features/profile/components/LinkRow/LinkRow";
import { OptionMenu } from "@/components/OptionMenu/OptionMenu";
import { StatRow } from "@/components/StatRow/StatRow";
import { links } from "@/features/profile/links";
import {
  minutesLabel,
  playedTime,
  sessionsLabel,
  WEEKLY_GOAL_CHOICES,
  weekDayMs,
} from "@/features/practice/domain/insights";
import {
  useActiveSessions,
  useFreePractice,
  usePracticeHistory,
  useUnfinishedPractice,
} from "@/features/practice/stores/practice-session";
import {
  setWeeklyGoal,
  useWeeklyGoal,
} from "@/features/practice/stores/weekly-goal";
import { colors } from "@/theme/colors";

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
        <PageTitle>Profile</PageTitle>
        <Button variant="text" tone="accent" onPress={() => router.back()}>
          Done
        </Button>
      </View>

      <View style={styles.section}>
        <SectionHeader title="YOUR PRACTICE" />
        <View style={styles.goalRow}>
          <SymbolView
            name="calendar"
            size={24}
            weight="light"
            tintColor={colors.text.secondary}
          />
          <AppText variant="body" tone="secondary" style={styles.goalLabel}>
            Weekly goal
          </AppText>
          <OptionMenu
            name="Weekly goal"
            options={GOAL_OPTIONS}
            selected={weeklyGoal}
            onChange={(goal) => setGoalSaveFailed(!setWeeklyGoal(goal))}
            align="end"
          >
            <AppText variant="bodyStrong" tabular>
              {sessionsLabel(weeklyGoal)}
            </AppText>
            <SymbolView
              name="chevron.down"
              size={12}
              weight="medium"
              tintColor={colors.text.secondary}
            />
          </OptionMenu>
        </View>
        {goalSaveFailed ? (
          <AppText
            variant="bodySmall"
            accessibilityRole="alert"
            style={styles.problem}
          >
            Your weekly goal could not be saved. Choose it again to retry.
          </AppText>
        ) : null}
        <StatRow
          symbol="clock"
          label="Played this week"
          value={`${minutesLabel(playedThisWeek)} min`}
          isLast
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="ABOUT" />
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
  section: {
    marginTop: 28,
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
  },
  problem: {
    paddingVertical: 12,
  },
});
