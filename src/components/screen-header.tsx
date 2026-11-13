import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

type ScreenHeaderProps = {
  onBack?: () => void;
};

export function ScreenHeader({ onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={onBack}
        >
          <SymbolView
            name="chevron.left"
            size={20}
            weight="medium"
            tintColor={colors.text.primary}
          />
        </Pressable>
      ) : null}
      <Text style={styles.wordmark}>ghostnote</Text>
      <View style={styles.rule} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        hitSlop={12}
      >
        <SymbolView
          name="person"
          size={24}
          weight="light"
          tintColor={colors.text.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  wordmark: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.body,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
