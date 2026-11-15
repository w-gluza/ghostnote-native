import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors } from "@/theme/colors";

type RhythmBarProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function RhythmBar({ children, style }: RhythmBarProps) {
  return <View style={[styles.bar, style]}>{children}</View>;
}

export function RhythmBarSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: colors.disabled,
  },
});
