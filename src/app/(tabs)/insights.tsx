import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AchievementRow, type Achievement } from "@/components/achievement-row";
import { ScreenHeader } from "@/components/screen-header";
import { StatRow } from "@/components/stat-row";
import {
  TechniqueBalance,
  type TechniqueShare,
} from "@/components/technique-balance";
import { WeekChart, type DayPractice } from "@/components/week-chart";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const week: DayPractice[] = [
  { day: "Monday", label: "M", minutes: 20 },
  { day: "Tuesday", label: "T", minutes: 0 },
  { day: "Wednesday", label: "W", minutes: 30 },
  { day: "Thursday", label: "T", minutes: 15 },
  { day: "Friday", label: "F", minutes: 25 },
  { day: "Saturday", label: "S", minutes: 0 },
  { day: "Sunday", label: "S", minutes: 35 },
];

const techniques: TechniqueShare[] = [
  { name: "Rolls", percent: 52, color: colors.accent },
  { name: "Diddles", percent: 28, color: colors.violet },
  { name: "Flams", percent: 20, color: colors.slate },
  { name: "Drags", percent: 0, color: colors.disabled },
];

const achievements: Achievement[] = [
  {
    symbol: "waveform",
    title: "Getting into rhythm",
    description: "Complete 50 practice sessions",
    progress: 42,
    goal: 50,
  },
  {
    symbol: "hourglass",
    title: "Dedicated drummer",
    description: "Complete 30 hours of practice",
    progress: 24,
    goal: 30,
  },
];

export default function InsightsScreen() {
  const weekMinutes = week.reduce((total, day) => total + day.minutes, 0);

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
        <WeekChart days={week} todayIndex={6} />
      </View>

      <View style={[styles.section, styles.divided]}>
        <View style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Technique balance
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Period: This month"
            hitSlop={12}
            style={({ pressed }) => [styles.period, pressed && styles.pressed]}
          >
            <Text style={styles.sectionAside}>This month</Text>
            <SymbolView
              name="chevron.down"
              size={12}
              weight="medium"
              tintColor={colors.text.secondary}
            />
          </Pressable>
        </View>
        <TechniqueBalance techniques={techniques} />
      </View>

      <View style={[styles.section, styles.divided]}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Your activity
        </Text>
        <View style={styles.stats}>
          <StatRow symbol="clock" label="Total practice time" value="24h 35m" />
          <StatRow symbol="calendar" label="Total sessions" value="42" />
          <StatRow
            symbol="clock.arrow.circlepath"
            label="Last practised"
            value="Today"
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
  period: {
    minHeight: 44,
    marginVertical: -10,
    flexDirection: "row",
    alignItems: "center",
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
