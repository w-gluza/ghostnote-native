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
  density?: "default" | "compact";
  indicator?: "chevron" | "checkmark";
  isLast?: boolean;
  onPress: () => void;
};

export function NumberedRow({
  position,
  accessibilityLabel,
  children,
  trailing,
  density = "default",
  indicator = "chevron",
  isLast = false,
  onPress,
}: NumberedRowProps) {
  const isCompact = density === "compact";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        styles[density],
        !isLast && styles.divided,
        pressed && layoutStyles.pressed,
      ]}
    >
      <AppText
        variant="body"
        tone="violet"
        tabular
        style={isCompact ? styles.compactPosition : styles.position}
      >
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
    flexDirection: "row",
  },
  default: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.lg,
  },
  compact: {
    paddingVertical: spacing.lg,
    alignItems: "flex-start",
    gap: spacing.md,
  },
  divided: {
    ...divider.bottom,
  },
  position: {
    width: 28,
    fontSize: typography.fontSize.heading,
  },
  compactPosition: {
    width: 24,
  },
  content: {
    flex: 1,
  },
});
