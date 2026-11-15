import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText/AppText";
import { InlineMessage } from "@/components/InlineMessage/InlineMessage";
import { SettingsRow } from "@/components/SettingsRow/SettingsRow";
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
    <SettingsRow
      symbol={symbol}
      isLast={isLast}
      accessibilityRole="link"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      onPress={() => {
        Linking.openURL(url).then(
          () => setHasFailed(false),
          () => setHasFailed(true),
        );
      }}
      footer={
        hasFailed ? (
          <InlineMessage selectable style={styles.problem}>
            This page could not be opened. You can find it at {url}
          </InlineMessage>
        ) : null
      }
    >
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
    </SettingsRow>
  );
}

const styles = StyleSheet.create({
  text: {
    flex: 1,
    gap: 4,
  },
  problem: {
    paddingBottom: 16,
  },
});
