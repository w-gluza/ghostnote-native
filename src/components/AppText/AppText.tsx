import { StyleSheet, Text, type TextProps } from "react-native";

import { colors } from "@/theme/colors";
import { textVariants, type TextVariant } from "@/theme/typography";

export type TextTone =
  "primary" | "secondary" | "accent" | "violet" | "onAccent";

type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  tabular?: boolean;
};

export function AppText({
  variant = "body",
  tone = "primary",
  tabular = false,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        textVariants[variant],
        tones[tone],
        tabular && styles.tabular,
        style,
      ]}
    />
  );
}

const tones = StyleSheet.create({
  primary: { color: colors.text.primary },
  secondary: { color: colors.text.secondary },
  accent: { color: colors.accent },
  violet: { color: colors.violet },
  onAccent: { color: colors.text.onAccent },
});

const styles = StyleSheet.create({
  tabular: { fontVariant: ["tabular-nums"] },
});
