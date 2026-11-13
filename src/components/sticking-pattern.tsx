import { StyleSheet, Text, View } from "react-native";

import type { RudimentPattern, Stroke } from "@/rudiments/types";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type StickingPatternProps = {
  pattern: RudimentPattern;
  activeIndex: number | null;
};

function describe(stroke: Stroke) {
  const hand = stroke.hand === "R" ? "right" : "left";
  return stroke.accent ? `${hand} accent` : hand;
}

export function StickingPattern({
  pattern,
  activeIndex,
}: StickingPatternProps) {
  const groupSize = pattern.grouping ?? pattern.subdivision;
  const groups: { stroke: Stroke; index: number }[][] = [];
  pattern.strokes.forEach((stroke, index) => {
    if (index % groupSize === 0) {
      groups.push([]);
    }
    groups[groups.length - 1]?.push({ stroke, index });
  });

  return (
    <View
      accessible
      accessibilityLabel={`Sticking: ${pattern.strokes.map(describe).join(", ")}`}
      style={styles.pattern}
    >
      {groups.map((group) => (
        <View key={group[0]?.index} style={styles.group}>
          {group.map(({ stroke, index }) => {
            const isActive = index === activeIndex;
            return (
              <View key={index} style={styles.cell}>
                <Text style={[styles.accent, isActive && styles.active]}>
                  {stroke.accent ? ">" : " "}
                </Text>
                <Text style={[styles.letter, isActive && styles.active]}>
                  {stroke.grace ? (
                    <Text style={styles.grace}>{stroke.grace.join("")}</Text>
                  ) : null}
                  {stroke.hand}
                </Text>
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
    columnGap: 16,
    rowGap: 8,
  },
  group: {
    flexDirection: "row",
  },
  cell: {
    minWidth: 26,
    alignItems: "center",
  },
  accent: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.label,
  },
  letter: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.title,
  },
  grace: {
    fontSize: typography.fontSize.caption,
  },
  active: {
    color: colors.accent,
  },
});
