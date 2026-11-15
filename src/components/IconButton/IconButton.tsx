import { SymbolView, type SymbolViewProps } from "expo-symbols";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "@/theme/colors";
import { layout, layoutStyles } from "@/theme/layout";

export type IconButtonVariant = "plain" | "tonal";
export type IconButtonTone = "default" | "muted";

type IconButtonProps = {
  icon: SymbolViewProps["name"];
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  tone?: IconButtonTone;
  size?: number;
  weight?: SymbolViewProps["weight"];
  disabled?: boolean;
  hitSlop?: PressableProps["hitSlop"];
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
};

export function IconButton({
  icon,
  accessibilityLabel,
  variant = "plain",
  tone = "default",
  size = 20,
  weight = "medium",
  disabled = false,
  hitSlop,
  style,
  onPress,
  onLongPress,
  onPressOut,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && layoutStyles.disabled,
        pressed && layoutStyles.pressed,
        style,
      ]}
    >
      <SymbolView
        name={icon}
        size={size}
        weight={weight}
        tintColor={
          tone === "muted" ? colors.text.secondary : colors.text.primary
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  plain: {
    minWidth: layout.minTouchSize,
    minHeight: layout.minTouchSize,
  },
  tonal: {
    width: layout.minTouchSize,
    height: layout.minTouchSize,
    borderRadius: layout.minTouchSize / 2,
    backgroundColor: colors.surface,
  },
});
