import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { spacing } from "@/theme/layout";

type EmptyStateProps = {
  children: string;
  action?: ReactNode;
};

export function EmptyState({ children, action }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <AppText variant="body" tone="secondary" style={styles.text}>
        {children}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.xl,
  },
  text: {
    lineHeight: 24,
    textAlign: "center",
  },
});
