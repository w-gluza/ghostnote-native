import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "@/theme/colors";
import { divider, layoutStyles, spacing } from "@/theme/layout";

type SettingsRowProps = {
  symbol: SymbolViewProps["name"];
  children: ReactNode;
  footer?: ReactNode;
  isLast?: boolean;
  accessible?: boolean;
  accessibilityRole?: "button" | "link";
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function SettingsRow({
  symbol,
  children,
  footer,
  isLast = false,
  accessible,
  accessibilityRole,
  accessibilityLabel,
  style,
  onPress,
}: SettingsRowProps) {
  const content = (
    <>
      <SymbolView
        name={symbol}
        size={24}
        weight="light"
        tintColor={colors.text.secondary}
      />
      {children}
    </>
  );

  return (
    <View style={!isLast && styles.divided}>
      {onPress ? (
        <Pressable
          accessibilityRole={accessibilityRole ?? "button"}
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          style={({ pressed }) => [
            styles.row,
            style,
            pressed && layoutStyles.pressed,
          ]}
        >
          {content}
        </Pressable>
      ) : (
        <View
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          style={[styles.row, style]}
        >
          {content}
        </View>
      )}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    minHeight: 56,
    paddingVertical: spacing.lg,
  },
  divided: {
    ...divider.bottom,
  },
});
