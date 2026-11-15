import { SymbolView, type SymbolViewProps } from "expo-symbols";
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";

export type ButtonVariant = "fill" | "tonal" | "text";
export type ButtonTone = "default" | "muted";

type ButtonProps = {
  children: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  icon?: SymbolViewProps["name"];
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

const TEXT_HIT_SLOP = 8;
const ICON_SIZE = 20;

export function Button({
  children,
  variant = "fill",
  tone = "default",
  icon,
  disabled = false,
  accessibilityLabel,
  style,
  onPress,
}: ButtonProps) {
  const labelColor =
    variant === "fill"
      ? colors.text.onAccent
      : tone === "muted"
        ? colors.text.secondary
        : colors.text.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={variant === "text" ? TEXT_HIT_SLOP : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? (
        <SymbolView
          name={icon}
          size={ICON_SIZE}
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
  pressed: {
    opacity: 0.7,
  },
  label: {
    flexShrink: 1,
    textAlign: "center",
  },
});
