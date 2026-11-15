import { Pressable, StyleSheet, Text, View } from "react-native";

import type { BeatKind } from "@/metronome/metronome";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type BeatPatternProps = {
  beats: BeatKind[];
  playingBeat: number;
  onPressBeat: (index: number) => void;
};

export function BeatPattern({
  beats,
  playingBeat,
  onPressBeat,
}: BeatPatternProps) {
  return (
    <View style={styles.row}>
      {beats.map((kind, index) => (
        <Pressable
          key={index}
          accessibilityRole="button"
          accessibilityLabel={`Beat ${index + 1}, ${kind}`}
          accessibilityHint="Changes between normal, accent and skipped"
          onPress={() => onPressBeat(index)}
          style={({ pressed }) => [styles.beat, pressed && styles.pressed]}
        >
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
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  beat: {
    width: 40,
    minHeight: 44,
    justifyContent: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
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
