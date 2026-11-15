import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

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
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  value: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.body,
    fontVariant: ["tabular-nums"],
  },
});
