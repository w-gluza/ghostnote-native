import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/layout";

type WeekProgressProps = {
  done: number;
  goal: number;
  unit?: string;
  description?: string;
};

export function WeekProgress({
  done,
  goal,
  unit = goal === 1 ? "session" : "sessions",
  description = `${done} of ${goal} ${unit} this week`,
}: WeekProgressProps) {
  return (
    <View accessible accessibilityLabel={description} style={styles.container}>
      <View style={styles.marks}>
        {Array.from({ length: goal }, (_, index) => (
          <View
            key={index}
            style={[styles.mark, index < done && styles.markDone]}
          />
        ))}
      </View>
      <AppText variant="bodySmall" tone="secondary">
        {done}/{goal} {unit}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  marks: {
    flexDirection: "row",
    gap: spacing.xs,
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
});
