import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { StatRow } from "@/components/stat-row";
import { routineLevel, todaysRoutine } from "@/rudiments/todays-routine";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export default function ProfileScreen() {
  const router = useRouter();

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
        <StatRow
          symbol="chart.bar"
          label="Level"
          value={`Lvl ${routineLevel(todaysRoutine)}`}
        />
        <StatRow symbol="calendar" label="Weekly goal" value="3 sessions" />
        <StatRow symbol="clock" label="Session length" value="20 min" isLast />
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          PREFERENCES
        </Text>
        <StatRow symbol="music.note" label="Default note value" value="1/4" />
        <StatRow symbol="speaker.wave.2" label="Click sound" value="Click" />
        <StatRow
          symbol="hand.raised"
          label="Leading hand"
          value="Right"
          isLast
        />
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          ABOUT
        </Text>
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
  pressed: {
    opacity: 0.7,
  },
});
