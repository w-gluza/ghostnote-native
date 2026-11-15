import { SymbolView, type SymbolViewProps } from "expo-symbols";
import {
  Pressable,
  StyleSheet,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";
import { layoutStyles } from "@/theme/layout";

export type ButtonVariant = "fill" | "tonal" | "text";
export type ButtonTone = "default" | "muted" | "accent";

type ButtonProps = {
  children: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  icon?: SymbolViewProps["name"];
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

const TEXT_HIT_SLOP = 8;
const toneColors = {
  default: colors.text.primary,
  muted: colors.text.secondary,
  accent: colors.accent,
};

export function Button({
  children,
  variant = "fill",
  tone = "default",
  icon,
  disabled = false,
  accessibilityLabel,
  accessibilityState,
  style,
  onPress,
}: ButtonProps) {
  const labelColor =
    variant === "fill" ? colors.text.onAccent : toneColors[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      disabled={disabled}
      hitSlop={variant === "text" ? TEXT_HIT_SLOP : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && layoutStyles.pressed,
        style,
      ]}
    >
      {icon ? (
        <SymbolView
          name={icon}
          size={variant === "fill" ? 20 : 14}
          weight="medium"
          tintColor={labelColor}
        />
      ) : null}
      <AppText
        variant={variant === "fill" ? "headline" : "label"}
        style={[styles.label, { color: labelColor }]}
      >
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fill: {
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  tonal: {
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  text: {
    minHeight: 44,
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    flexShrink: 1,
    textAlign: "center",
  },
});
