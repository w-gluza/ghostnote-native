import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "@/components/AppText/AppText";

type SectionHeaderProps = {
  title: string;
  variant?: "label" | "heading";
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({
  title,
  variant = "label",
  trailing,
  style,
}: SectionHeaderProps) {
  const isLabel = variant === "label";

  return (
    <View style={[styles.header, styles[variant], style]}>
      <AppText
        variant={isLabel ? "overline" : "heading"}
        tone={isLabel ? "secondary" : "primary"}
        accessibilityRole="header"
        style={styles.title}
      >
        {title}
      </AppText>
      {typeof trailing === "string" ? (
        <AppText variant={isLabel ? "caption" : "body"} tone="secondary">
          {trailing}
        </AppText>
      ) : (
        trailing
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  label: {
    alignItems: "center",
    marginBottom: 4,
  },
  heading: {
    alignItems: "baseline",
  },
  title: {
    flexShrink: 1,
  },
});
