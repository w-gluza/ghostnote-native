import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { spacing } from "@/theme/layout";

type PageTitleProps = Omit<
  ComponentProps<typeof AppText>,
  "variant" | "tone" | "tabular" | "accessibilityRole"
> & {
  trailing?: ReactNode;
};

export function PageTitle({ trailing, style, ...props }: PageTitleProps) {
  const title = (
    <AppText
      {...props}
      variant="title"
      accessibilityRole="header"
      style={[styles.title, trailing !== undefined && styles.shrink, style]}
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
  title: {
    paddingTop: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  shrink: {
    flexShrink: 1,
  },
});
