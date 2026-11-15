import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type LinkRowProps = {
  symbol: SymbolViewProps["name"];
  label: string;
  detail?: string;
  url: string;
  isLast?: boolean;
};

export function LinkRow({ symbol, label, detail, url, isLast }: LinkRowProps) {
  const [hasFailed, setHasFailed] = useState(false);

  return (
    <View style={!isLast && styles.divided}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={detail ? `${label}, ${detail}` : label}
        onPress={() => {
          Linking.openURL(url).then(
            () => setHasFailed(false),
            () => setHasFailed(true),
          );
        }}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <SymbolView
          name={symbol}
          size={24}
          weight="light"
          tintColor={colors.text.secondary}
        />
        <View style={styles.text}>
          <Text style={styles.label}>{label}</Text>
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>
        <SymbolView
          name="arrow.up.right"
          size={13}
          weight="medium"
          tintColor={colors.text.secondary}
        />
      </Pressable>
      {hasFailed ? (
        <Text accessibilityRole="alert" selectable style={styles.problem}>
          This page could not be opened. You can find it at {url}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 56,
    paddingVertical: 16,
  },
  divided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.body,
  },
  detail: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
  },
  problem: {
    paddingBottom: 16,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
  },
  pressed: {
    opacity: 0.7,
  },
});
