import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { spacing } from "@/theme/layout";
import { typography } from "@/theme/typography";

type StatProps = {
  value: string | number;
  label: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Stat({ value, label, accessibilityLabel, style }: StatProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[styles.stat, style]}
    >
      <AppText variant="heading" tabular style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    alignItems: "center",
    gap: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.title,
  },
});
