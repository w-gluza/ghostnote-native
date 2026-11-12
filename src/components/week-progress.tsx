import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type WeekProgressProps = {
  done: number;
  goal: number;
};

export function WeekProgress({ done, goal }: WeekProgressProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${done} of ${goal} sessions this week`}
      style={styles.container}
    >
      <View style={styles.marks}>
        {Array.from({ length: goal }, (_, index) => (
          <View
            key={index}
            style={[styles.mark, index < done && styles.markDone]}
          />
        ))}
      </View>
      <Text style={styles.label}>
        {done}/{goal} sessions
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  marks: {
    flexDirection: "row",
    gap: 5,
  },
  mark: {
    width: 3,
    height: 20,
    borderRadius: 1.5,
    backgroundColor: colors.disabled,
    transform: [{ rotate: "24deg" }],
  },
  markDone: {
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
});
