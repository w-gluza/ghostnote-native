import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { PageTitle } from "@/components/PageTitle/PageTitle";
import {
  AchievementRow,
  type Achievement,
} from "@/features/insights/components/AchievementRow/AchievementRow";
import { OptionMenu } from "@/components/OptionMenu/OptionMenu";
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader";
import { StatRow } from "@/components/StatRow/StatRow";
import {
  TechniqueBalance,
  type TechniqueShare,
} from "@/features/insights/components/TechniqueBalance/TechniqueBalance";
import {
  WeekChart,
  type DayPractice,
} from "@/features/insights/components/WeekChart/WeekChart";
import {
  achievements as practiceAchievements,
  durationLabel,
  lastPractisedLabel,
  periodStart,
  minutesLabel,
  playedTime,
  practiceSessions,
  techniqueShares,
  todayIndex,
  totalMs,
  weekDayMs,
  type Period,
} from "@/features/practice/domain/insights";
import {
  useActiveSessions,
  useFreePractice,
  usePracticeHistory,
  useUnfinishedPractice,
} from "@/features/practice/stores/practice-session";
import { colors } from "@/theme/colors";
import { divider, layoutStyles, spacing } from "@/theme/layout";

const DAYS = [
  { day: "Monday", label: "M" },
  { day: "Tuesday", label: "T" },
  { day: "Wednesday", label: "W" },
  { day: "Thursday", label: "T" },
  { day: "Friday", label: "F" },
  { day: "Saturday", label: "S" },
  { day: "Sunday", label: "S" },
];

const TECHNIQUE_COLORS = [
  colors.accent,
  colors.violet,
  colors.slate,
  colors.disabled,
];

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
];

const ACHIEVEMENT_SYMBOLS = {
  sessions: "waveform",
  hours: "hourglass",
} as const;

export default function InsightsScreen() {
  const history = usePracticeHistory();
  const free = useFreePractice();
  const active = useActiveSessions();
  const unfinished = useUnfinishedPractice();
  const [period, setPeriod] = useState<Period>("month");
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, []),
  );

  const rounds = playedTime(
    [...history, ...free, ...Object.values(active)],
    unfinished,
  );
  const dayMs = weekDayMs(rounds, now);
  const week: DayPractice[] = DAYS.map((day, index) => ({
    ...day,
    ms: dayMs[index] ?? 0,
  }));
  const weekMinutes = minutesLabel(dayMs.reduce((total, ms) => total + ms, 0));
  const shares = techniqueShares(rounds, periodStart(period, now));
  const techniques: TechniqueShare[] = shares.map((share, index) => ({
    ...share,
    color: TECHNIQUE_COLORS[index] ?? colors.disabled,
  }));
  const hasBalance = shares.some((share) => share.percent > 0);
  const practised = totalMs(rounds);
  const achievements: Achievement[] = practiceAchievements(
    practiceSessions(history).length,
    practised,
  ).map((achievement) => ({
    ...achievement,
    symbol: ACHIEVEMENT_SYMBOLS[achievement.key],
  }));

  return (
    <ScrollView
      style={layoutStyles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={layoutStyles.contentBelowHeader}
    >
      <ScreenHeader />

      <PageTitle size="large" style={styles.title}>
        Insights
      </PageTitle>

      <View style={styles.section}>
        <SectionHeader
          variant="heading"
          title="This week"
          trailing={`${weekMinutes} min`}
        />
        <WeekChart days={week} todayIndex={todayIndex(now)} />
      </View>

      <View style={[styles.section, styles.divided]}>
        <SectionHeader
          variant="heading"
          title="Technique balance"
          style={styles.sectionHeaderSpaced}
          trailing={
            <OptionMenu
              name="Period"
              options={PERIODS}
              selected={period}
              onChange={setPeriod}
              align="end"
              style={styles.period}
            >
              <AppText variant="body" tone="secondary">
                {PERIODS.find((option) => option.key === period)?.label}
              </AppText>
            </OptionMenu>
          }
        />
        {hasBalance ? (
          <TechniqueBalance techniques={techniques} />
        ) : (
          <EmptyState>
            Play a round in a routine to see how your practice is split.
          </EmptyState>
        )}
      </View>

      <View style={[styles.section, styles.divided]}>
        <SectionHeader variant="heading" title="Your activity" />
        <View>
          <StatRow
            symbol="clock"
            label="Total practice time"
            value={durationLabel(practised)}
          />
          <StatRow
            symbol="calendar"
            label="Total sessions"
            value={`${practiceSessions(history).length}`}
          />
          <StatRow
            symbol="clock.arrow.circlepath"
            label="Last practised"
            value={lastPractisedLabel(rounds, now)}
            isLast
          />
        </View>
      </View>

      <View style={[styles.section, styles.divided]}>
        <SectionHeader variant="heading" title="Achievements" />
        <View style={styles.achievements}>
          {achievements.map((achievement) => (
            <AchievementRow key={achievement.title} achievement={achievement} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.xxl,
  },
  section: {
    marginTop: spacing.section,
  },
  divided: {
    paddingTop: spacing.section,
    ...divider.top,
  },
  sectionHeaderSpaced: {
    marginBottom: spacing.lg,
  },
  period: {
    marginVertical: -10,
    flexShrink: 0,
  },
  achievements: {
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
});
