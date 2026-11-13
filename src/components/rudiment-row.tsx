import { SymbolView } from "expo-symbols";
import type { VideoSource } from "expo-video";
import { StyleSheet, Text, View } from "react-native";

import { RudimentVideo } from "@/components/rudiment-video";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export type Rudiment = {
  name: string;
  minutes: number;
  rounds: number;
  bpm: number;
  video?: VideoSource;
};

type RudimentRowProps = {
  rudiment: Rudiment;
  position: number;
  isLast: boolean;
};

export function RudimentRow({ rudiment, position, isLast }: RudimentRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View style={styles.line} />
        <Text style={styles.position}>{String(position).padStart(2, "0")}</Text>
        <View style={styles.line} />
      </View>
      <View style={[styles.body, !isLast && styles.bodyDivider]}>
        <View style={styles.details}>
          <Text style={styles.name}>{rudiment.name}</Text>
          <Text style={styles.meta}>
            {rudiment.minutes} min • {rudiment.rounds} rounds
          </Text>
          <Text style={styles.bpm}>{rudiment.bpm}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </View>
        <View style={styles.thumbnail}>
          {rudiment.video ? (
            <RudimentVideo source={rudiment.video} label={rudiment.name} />
          ) : (
            <SymbolView
              name="play.circle.fill"
              size={28}
              tintColor={colors.accent}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  timeline: {
    width: 24,
    alignItems: "center",
    gap: 8,
  },
  line: {
    flex: 1,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.disabled,
  },
  position: {
    color: colors.violet,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  bodyDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.disabled,
  },
  details: {
    flex: 1,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  meta: {
    marginTop: 2,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  bpm: {
    marginTop: 6,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
  bpmLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  thumbnail: {
    width: 88,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
