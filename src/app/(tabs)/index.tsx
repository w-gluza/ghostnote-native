import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { RudimentRow, type Rudiment } from "@/components/rudiment-row";
import { ScreenHeader } from "@/components/screen-header";
import { WeekProgress } from "@/components/week-progress";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

const rudiments: Rudiment[] = [
  {
    name: "Single Stroke Roll",
    minutes: 4,
    rounds: 3,
    bpm: 80,
    video: require("@/assets/videos/accent_single_paraddilde_85.mp4"),
  },
  {
    name: "Double Stroke Roll",
    minutes: 4,
    rounds: 3,
    bpm: 70,
    video: require("@/assets/videos/accent_single_paraddilde_85.mp4"),
  },
  {
    name: "Single Paradiddle",
    minutes: 4,
    rounds: 3,
    bpm: 60,
    video: require("@/assets/videos/accent_single_paraddilde_85.mp4"),
  },
];

export default function PracticeScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <ScreenHeader />

      <Text accessibilityRole="header" style={styles.title}>
        {"Today's\nPractice"}
      </Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>20 min • 3 rudiments • Lvl 1</Text>
        <WeekProgress done={2} goal={3} />
      </View>

      <View style={styles.card}>
        {rudiments.map((rudiment, index) => (
          <RudimentRow
            key={rudiment.name}
            rudiment={rudiment}
            position={index + 1}
            isLast={index === rudiments.length - 1}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.start, pressed && styles.pressed]}
      >
        <Text style={styles.startLabel}>Start Practice</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        hitSlop={12}
        style={({ pressed }) => [styles.saved, pressed && styles.pressed]}
      >
        <Text style={styles.savedLabel}>Saved Routines</Text>
      </Pressable>
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
  summary: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  card: {
    marginTop: 32,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 20,
    borderRadius: 28,
    backgroundColor: colors.surface,
  },
  start: {
    marginTop: 24,
    alignSelf: "center",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  startLabel: {
    color: colors.text.onAccent,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  saved: {
    marginTop: 16,
    alignSelf: "center",
  },
  savedLabel: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.label,
  },
  pressed: {
    opacity: 0.7,
  },
});
