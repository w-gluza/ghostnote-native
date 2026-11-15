import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import { AppText } from "@/components/AppText/AppText";

type PageTitleProps = Omit<
  ComponentProps<typeof AppText>,
  "variant" | "tone" | "tabular" | "accessibilityRole"
> & {
  size?: "default" | "large";
};

export function PageTitle({
  size = "default",
  style,
  ...props
}: PageTitleProps) {
  return (
    <AppText
      {...props}
      variant={size === "large" ? "display" : "title"}
      accessibilityRole="header"
      style={[styles[size], style]}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    paddingTop: 6,
  },
  large: {
    paddingTop: 10,
  },
});
