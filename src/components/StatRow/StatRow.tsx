import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";

type StatRowProps = {
  symbol: SymbolViewProps["name"];
  label: string;
  value: string;
  isLast?: boolean;
};

export function StatRow({ symbol, label, value, isLast }: StatRowProps) {
  return (
    <View accessible style={[styles.row, !isLast && styles.divided]}>
      <SymbolView
        name={symbol}
        size={24}
        weight="light"
        tintColor={colors.text.secondary}
      />
      <AppText variant="body" tone="secondary" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="bodyStrong" tabular>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  divided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    flex: 1,
  },
});
