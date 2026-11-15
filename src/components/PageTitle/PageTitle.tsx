import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";

type PageTitleProps = Omit<
  ComponentProps<typeof AppText>,
  "variant" | "tone" | "tabular" | "accessibilityRole"
> & {
  size?: "default" | "large";
  trailing?: ReactNode;
};

export function PageTitle({
  size = "default",
  trailing,
  style,
  ...props
}: PageTitleProps) {
  const title = (
    <AppText
      {...props}
      variant={size === "large" ? "display" : "title"}
      accessibilityRole="header"
      style={[styles[size], trailing !== undefined && styles.shrink, style]}
    />
  );

  if (trailing === undefined) {
    return title;
  }

  return (
    <View style={styles.row}>
      {title}
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  default: {
    paddingTop: 6,
  },
  large: {
    paddingTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  shrink: {
    flexShrink: 1,
  },
});
