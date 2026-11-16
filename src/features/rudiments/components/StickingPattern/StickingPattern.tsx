import { StyleSheet, Text, View } from "react-native";

import type {
  Timeline,
  TimelineStroke,
} from "@/features/rudiments/domain/timeline";
import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing } from "@/theme/layout";

type StickingPatternProps = {
  timeline: Timeline;
  activeIndex: number | null;
};

function describe(stroke: TimelineStroke) {
  const hand = stroke.hand === "R" ? "right" : "left";
  return stroke.accent ? `${hand} accent` : hand;
}

export function StickingPattern({
  timeline,
  activeIndex,
}: StickingPatternProps) {
  const groups = timeline.phrases.map((phrase) =>
    phrase.flatMap((index) => {
      const stroke = timeline.strokes[index];
      return stroke ? [{ stroke, index }] : [];
    }),
  );

  return (
    <View
      accessible
      accessibilityLabel={`Sticking: ${timeline.strokes.map(describe).join(", ")}`}
      style={styles.pattern}
    >
      {groups.map((group) => (
        <View key={group[0]?.index} style={styles.group}>
          {group.map(({ stroke, index }) => {
            const isActive = index === activeIndex;
            return (
              <View key={index} style={styles.cell}>
                <AppText
                  variant="label"
                  tone={isActive ? "accent" : "secondary"}
                  style={styles.accent}
                >
                  {stroke.accent ? ">" : " "}
                </AppText>
                <AppText
                  variant="heading"
                  tone={isActive ? "accent" : "secondary"}
                >
                  {stroke.grace.length > 0 ? (
                    <Text style={styles.grace}>{stroke.grace.join("")}</Text>
                  ) : null}
                  {stroke.hand}
                </AppText>
                <View
                  style={[styles.playhead, isActive && styles.playheadActive]}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pattern: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: spacing.lg,
    rowGap: spacing.sm,
  },
  group: {
    flexDirection: "row",
  },
  cell: {
    minWidth: 26,
    alignItems: "center",
  },
  accent: {
    fontFamily: typography.fontFamily.semibold,
  },
  playhead: {
    alignSelf: "stretch",
    height: 2,
    marginTop: spacing.xs,
    marginHorizontal: spacing.xs,
    borderRadius: 1,
  },
  playheadActive: {
    backgroundColor: colors.violet,
  },
  grace: {
    fontSize: typography.fontSize.caption,
  },
});
