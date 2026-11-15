import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText, type TextTone } from "@/components/AppText/AppText";
import { spacing } from "@/theme/layout";

type RowTextProps = {
  title: string;
  label?: string;
  detail?: ReactNode;
  titleTone?: TextTone;
  titleLines?: number;
  style?: StyleProp<ViewStyle>;
};

export function RowText({
  title,
  label,
  detail,
  titleTone = "primary",
  titleLines,
  style,
}: RowTextProps) {
  return (
    <View style={style}>
      {label ? (
        <AppText variant="overline" tone="secondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <AppText variant="heading" tone={titleTone} numberOfLines={titleLines}>
        {title}
      </AppText>
      {typeof detail === "string" ? (
        <AppText
          variant="bodySmall"
          tone="secondary"
          tabular
          style={styles.detail}
        >
          {detail}
        </AppText>
      ) : detail ? (
        <View style={styles.detail}>{detail}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
  },
  detail: {
    marginTop: spacing.sm,
  },
});
