import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";
import { divider, layoutStyles, spacing } from "@/theme/layout";
import { typography } from "@/theme/typography";

type NumberedRowProps = {
  position: number;
  accessibilityLabel: string;
  children: ReactNode;
  trailing?: ReactNode;
  indicator?: "chevron" | "checkmark";
  isLast?: boolean;
  onPress: () => void;
};

export function NumberedRow({
  position,
  accessibilityLabel,
  children,
  trailing,
  indicator = "chevron",
  isLast = false,
  onPress,
}: NumberedRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.divided,
        pressed && layoutStyles.pressed,
      ]}
    >
      <AppText variant="body" tone="violet" tabular style={styles.position}>
        {String(position).padStart(2, "0")}
      </AppText>
      <View style={styles.content}>{children}</View>
      {trailing}
      <SymbolView
        name={indicator === "checkmark" ? "checkmark" : "chevron.right"}
        size={13}
        weight="medium"
        tintColor={
          indicator === "checkmark" ? colors.accent : colors.text.secondary
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  divided: {
    ...divider.bottom,
  },
  position: {
    width: 28,
    fontSize: typography.fontSize.heading,
  },
  content: {
    flex: 1,
  },
});
