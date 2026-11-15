import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { colors } from "@/theme/colors";

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
          <AppText variant="body">{label}</AppText>
          {detail ? (
            <AppText variant="caption" tone="secondary">
              {detail}
            </AppText>
          ) : null}
        </View>
        <SymbolView
          name="arrow.up.right"
          size={13}
          weight="medium"
          tintColor={colors.text.secondary}
        />
      </Pressable>
      {hasFailed ? (
        <AppText
          variant="bodySmall"
          accessibilityRole="alert"
          selectable
          style={styles.problem}
        >
          This page could not be opened. You can find it at {url}
        </AppText>
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
  problem: {
    paddingBottom: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
