import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

export type BeatKind = "accent" | "normal" | "skipped";

type BeatPatternProps = {
  beats: BeatKind[];
  playingBeat: number;
};

export function BeatPattern({ beats, playingBeat }: BeatPatternProps) {
  const summary = beats
    .map((kind, index) => {
      const beat = index + 1;
      return `beat ${beat} ${kind}${beat === playingBeat ? ", playing" : ""}`;
    })
    .join("; ");

  return (
    <View accessible accessibilityLabel={summary} style={styles.row}>
      {beats.map((kind, index) => (
        <View key={index} style={styles.beat}>
          <Text style={styles.accentMark}>{kind === "accent" ? ">" : " "}</Text>
          <View
            style={[
              styles.pill,
              kind === "accent" && styles.pillAccent,
              kind === "skipped" && styles.pillSkipped,
            ]}
          />
          <View
            style={[
              styles.playhead,
              index + 1 === playingBeat && styles.playheadActive,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  beat: {
    width: 40,
    gap: 4,
  },
  accentMark: {
    textAlign: "center",
    color: colors.accent,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.label,
  },
  pill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.disabled,
  },
  pillAccent: {
    backgroundColor: colors.accent,
  },
  pillSkipped: {
    borderWidth: 1,
    borderColor: colors.disabled,
    backgroundColor: "transparent",
  },
  playhead: {
    height: 2,
    borderRadius: 1,
  },
  playheadActive: {
    backgroundColor: colors.violet,
  },
});
