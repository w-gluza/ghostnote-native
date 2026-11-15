import type { SymbolViewProps } from "expo-symbols";
import { StyleSheet } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { SettingsRow } from "@/components/SettingsRow/SettingsRow";

type StatRowProps = {
  symbol: SymbolViewProps["name"];
  label: string;
  value: string;
  isLast?: boolean;
};

export function StatRow({ symbol, label, value, isLast }: StatRowProps) {
  return (
    <SettingsRow symbol={symbol} isLast={isLast} accessible>
      <AppText variant="body" tone="secondary" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="bodyStrong" tabular>
        {value}
      </AppText>
    </SettingsRow>
  );
}

const styles = StyleSheet.create({
  label: {
    flex: 1,
  },
});
