import { useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AchievementRow,
  type Achievement,
} from "@/components/AchievementRow/AchievementRow";
import { OptionMenu } from "@/components/OptionMenu/OptionMenu";
import { ScreenHeader } from "@/components/ScreenHeader/ScreenHeader";
import { StatRow } from "@/components/StatRow/StatRow";
import {
  TechniqueBalance,
  type TechniqueShare,
} from "@/components/TechniqueBalance/TechniqueBalance";
import { WeekChart, type DayPractice } from "@/components/WeekChart/WeekChart";
import {
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
} from "@/rudiments/insights";
import {
  useActiveSessions,
  useFreePractice,
  usePracticeHistory,
  useUnfinishedPractice,
} from "@/rudiments/practice-session";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

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

const SESSIONS_GOAL = 50;
const HOURS_GOAL = 30;
const HOUR_MS = 60 * 60 * 1000;

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
  const achievements: Achievement[] = [
    {
      symbol: "waveform",
      title: "Getting into rhythm",
      description: `Complete ${SESSIONS_GOAL} practice sessions`,
      progress: Math.min(practiceSessions(history).length, SESSIONS_GOAL),
      goal: SESSIONS_GOAL,
    },
    {
      symbol: "hourglass",
      title: "Dedicated drummer",
      description: `Complete ${HOURS_GOAL} hours of practice`,
      progress: Math.min(Math.floor(practised / HOUR_MS), HOURS_GOAL),
      goal: HOURS_GOAL,
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <ScreenHeader />

      <Text accessibilityRole="header" style={styles.title}>
        Insights
      </Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            This week
          </Text>
          <Text style={styles.sectionAside}>{weekMinutes} min</Text>
        </View>
        <WeekChart days={week} todayIndex={todayIndex(now)} />
      </View>

      <View style={[styles.section, styles.divided]}>
        <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Technique balance
          </Text>
          <OptionMenu
            name="Period"
            options={PERIODS}
            selected={period}
            onChange={setPeriod}
            align="end"
            style={styles.period}
          >
            <Text style={styles.sectionAside}>
              {PERIODS.find((option) => option.key === period)?.label}
            </Text>
            <SymbolView
              name="chevron.down"
              size={12}
              weight="medium"
              tintColor={colors.text.secondary}
            />
          </OptionMenu>
        </View>
        {hasBalance ? (
          <TechniqueBalance techniques={techniques} />
        ) : (
          <Text style={styles.empty}>
            Play a round in a routine to see how your practice is split.
          </Text>
        )}
      </View>

      <View style={[styles.section, styles.divided]}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Your activity
        </Text>
        <View style={styles.stats}>
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
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Achievements
        </Text>
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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    marginTop: 30,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.display,
    lineHeight: 46,
    paddingTop: 10,
    letterSpacing: -0.5,
  },
  section: {
    marginTop: 28,
  },
  divided: {
    paddingTop: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  sectionHeaderSpaced: {
    marginBottom: 20,
  },
  sectionTitle: {
    flexShrink: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
  sectionAside: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  empty: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    lineHeight: 20,
  },
  period: {
    marginVertical: -10,
    flexShrink: 0,
    gap: 6,
  },
  stats: {
    marginTop: 4,
  },
  achievements: {
    marginTop: 20,
    gap: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
